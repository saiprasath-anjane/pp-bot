import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { crawlJobs, pages, chunks } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { qdrant } from '$lib/qdrant';
import { verifyAdminToken, COOKIE_NAME } from '$lib/server/adminAuth';

export async function GET({ cookies }) {
  const token = cookies.get(COOKIE_NAME);
  if (!verifyAdminToken(token)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await db.query.crawlJobs.findMany({
    orderBy: desc(crawlJobs.createdAt),
    limit: 20
  });

  return json(jobs);
}

export async function DELETE({ url, cookies }) {
  const token = cookies.get(COOKIE_NAME);
  if (!verifyAdminToken(token)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = url.searchParams.get('jobId') ?? '';

  const jobPages = await db.query.pages.findMany({
    where: eq(pages.crawlJobId, jobId)
  });

  for (const pg of jobPages) {
    const pageChunks = await db.query.chunks.findMany({
      where: eq(chunks.pageId, pg.id)
    });

    const ids = pageChunks.map(c => c.id);
    if (ids.length > 0) {
      await qdrant.delete('pages', { points: ids });
    }

    await db.delete(chunks).where(eq(chunks.pageId, pg.id));
  }

  await db.delete(pages).where(eq(pages.crawlJobId, jobId));
  await db.delete(crawlJobs).where(eq(crawlJobs.id, jobId));

  return json({ success: true });
}
