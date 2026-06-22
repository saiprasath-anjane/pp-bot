import { json } from '@sveltejs/kit';
import { crawlAndIndex } from '$lib/server/crawler';
import { verifyAdminToken, COOKIE_NAME } from '$lib/server/adminAuth';

export async function POST({ request, cookies }) {
  const token = cookies.get(COOKIE_NAME);
  if (!verifyAdminToken(token)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { urls, maxPages, extraDomains } = await request.json();

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return json({ error: 'urls array is required' }, { status: 400 });
  }

  const result = await crawlAndIndex(urls, maxPages ?? 50, extraDomains ?? []);

  return json(result);
}
