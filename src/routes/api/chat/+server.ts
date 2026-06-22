import { json } from '@sveltejs/kit';
import { getEmbedding } from '$lib/embeddings';
import { qdrant } from '$lib/qdrant';
import { groq } from '$lib/server/groq';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST({ request }) {
  const { question, history } = await request.json();

  const questionVector = await getEmbedding(question);

  const results = await qdrant.search('pages', {
    vector: questionVector,
    limit: 5
  });

  const context = results.map((r: any) => r.payload.text).join('\n\n');
  const sources = [...new Set(results.map((r: any) => r.payload.source))];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a helpful documentation assistant. Answer using ONLY the context below. If the answer is not in the context, say "I don't know".

Context:
${context}`
      },
      ...(history ?? []),
      { role: 'user', content: question }
    ]
  });

  const answer = response.choices[0].message.content ?? '';

  return json({ answer, sources }, { headers: corsHeaders });
}
