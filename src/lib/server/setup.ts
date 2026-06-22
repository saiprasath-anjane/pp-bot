import { qdrant } from '$lib/qdrant';

export async function setupQdrant() {
  const { collections } = await qdrant.getCollections();
  const exists = collections.some(c => c.name === 'pages');

  if (!exists) {
    await qdrant.createCollection('pages', {
      vectors: {
        size: 384,
        distance: 'Cosine'
      }
    });
    console.log('Created pages collection');
  }
}
