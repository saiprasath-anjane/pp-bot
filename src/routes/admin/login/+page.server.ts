import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { checkPassword, createAdminToken, COOKIE_NAME } from '$lib/server/adminAuth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const password = formData.get('password')?.toString() ?? '';

    if (!checkPassword(password)) {
      return fail(400, { message: 'Incorrect password' });
    }

    const token = createAdminToken();
    cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return redirect(302, '/');
  }
};
