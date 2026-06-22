import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_URL, QDRANT_API_KEY } from '$env/static/private';

export const qdrant = new QdrantClient({
  url: QDRANT_URL ?? 'http://localhost:6333',
  apiKey: QDRANT_API_KEY
});
