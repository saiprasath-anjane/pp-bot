import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_URL } from '$env/static/private';

export const qdrant = new QdrantClient({
  url: QDRANT_URL ?? 'http://localhost:6333'
});
