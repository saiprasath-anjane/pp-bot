import { building } from '$app/environment';
import { setupQdrant } from '$lib/server/setup';

if (!building) {
  setupQdrant();
}
