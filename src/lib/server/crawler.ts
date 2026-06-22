import { PlaywrightCrawler } from 'crawlee';
import * as cheerio from 'cheerio';
import { db } from '$lib/server/db';
import { pages, chunks, crawlJobs } from '$lib/server/db/schema';
import { getEmbedding } from '$lib/embeddings';
import { qdrant } from '$lib/qdrant';
import { eq } from 'drizzle-orm';

function extractMainText(html: string): { title: string; text: string } {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, aside, noscript, iframe').remove();
  const title = $('title').text().trim() || $('h1').first().text().trim();
  let content = $('main').text() || $('article').text() || $('body').text();
  content = content.replace(/\s+/g, ' ').trim();
  return { title, text: content };
}

function chunkText(text: string, size = 500): string[] {
  const words = text.split(' ');
  const result: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    result.push(words.slice(i, i + size).join(' '));
  }
  return result;
}

function buildGlobs(baseUrls: string[], extraDomains: string[]): string[] {
  const domains = new Set<string>();

  for (const url of baseUrls) {
    try {
      domains.add(new URL(url).hostname.replace(/^www\./, ''));
    } catch {}
  }

  for (const domain of extraDomains) {
    domains.add(domain.replace(/^www\./, ''));
  }

  const globs: string[] = [];
  for (const domain of domains) {
    globs.push(`https://${domain}/**`);
    globs.push(`https://*.${domain}/**`);
  }

  return globs;
}

export async function crawlAndIndex(baseUrls: string[], maxPages = 50, extraDomains: string[] = []) {
  const [job] = await db.insert(crawlJobs).values({
    baseUrl: baseUrls.join(', '),
    status: 'crawling'
  }).returning();

  let pagesProcessed = 0;
  const globs = buildGlobs(baseUrls, extraDomains);

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: maxPages,
    async requestHandler({ request, page, enqueueLinks }) {
      const html = await page.content();
      const { title, text } = extractMainText(html);

      if (text.length > 100) {
        const [savedPage] = await db.insert(pages).values({
          crawlJobId: job.id,
          url: request.url,
          title
        }).returning();

        const textChunks = chunkText(text);

        for (let i = 0; i < textChunks.length; i++) {
          const chunk = textChunks[i];

          const [savedChunk] = await db.insert(chunks).values({
            pageId: savedPage.id,
            content: chunk,
            chunkIndex: i
          }).returning();

          const vector = await getEmbedding(chunk);

          await qdrant.upsert('pages', {
            points: [{
              id: savedChunk.id,
              vector,
              payload: {
                chunkId: savedChunk.id,
                pageId: savedPage.id,
                text: chunk,
                source: request.url,
                title
              }
            }]
          });
        }

        pagesProcessed++;
      }

      await enqueueLinks({ globs });
    }
  });

  await crawler.run(baseUrls);

  await db.update(crawlJobs)
    .set({ status: 'done', pagesFound: pagesProcessed })
    .where(eq(crawlJobs.id, job.id));

  return { jobId: job.id, pagesProcessed };
}
