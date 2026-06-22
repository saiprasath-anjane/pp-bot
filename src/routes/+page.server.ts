import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdminToken, COOKIE_NAME } from '$lib/server/adminAuth';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get(COOKIE_NAME);
  if (!verifyAdminToken(token)) {
    return redirect(302, '/admin/login');
  }
  return {};
};

export const actions: Actions = {
  signOut: async ({ cookies }) => {
    cookies.delete(COOKIE_NAME, { path: '/' });
    return redirect(302, '/admin/login');
  }
};
