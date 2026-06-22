import jwt from 'jsonwebtoken';
import { ADMIN_SESSION_SECRET, ADMIN_PASSWORD } from '$env/static/private';

const COOKIE_NAME = 'admin_session';

export function checkPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createAdminToken(): string {
  return jwt.sign({ role: 'admin' }, ADMIN_SESSION_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    jwt.verify(token, ADMIN_SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
