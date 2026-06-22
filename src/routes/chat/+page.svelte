<script lang="ts">
  import { marked } from 'marked';
  let question = $state('');
  let asking = $state(false);
  let messages = $state<{ role: 'user' | 'assistant'; text: string; sources?: string[] }[]>([]);

  async function askQuestion() {
    if (!question.trim()) return;
    const q = question;
    question = '';
    messages = [...messages, { role: 'user', text: q }];
    asking = true;

    const history = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.text
    }));

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, history })
    });

    const data = await res.json();
    messages = [...messages, { role: 'assistant', text: data.answer, sources: data.sources }];
    asking = false;
  }
</script>

<div class="min-h-screen bg-white font-sans flex flex-col">
  <header class="border-b border-gray-100 px-6 py-4 text-center">
    <h1 class="text-lg font-semibold tracking-tight text-gray-900">Ask Perkspe Docs</h1>
    <p class="text-xs text-gray-400">Get instant answers from our documentation</p>
  </header>

  <main class="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6 pb-32">
    {#if messages.length === 0}
      <div class="text-center py-24 text-gray-300 text-sm">
        Ask anything about Perkspe
      </div>
    {/if}

    {#each messages as msg}
      <div class="flex flex-col gap-1 {msg.role === 'user' ? 'items-end' : 'items-start'}">
        <div class="max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed prose prose-sm
          {msg.role === 'user'
            ? 'bg-gray-900 text-white rounded-br-sm prose-invert'
            : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'}">
          {#if msg.role === 'assistant'}
            {@html marked(msg.text)}
          {:else}
            {msg.text}
          {/if}
        </div>
        {#if msg.sources?.length}
          <p class="text-xs text-gray-400 px-1">
            Source: {msg.sources.join(', ')}
          </p>
        {/if}
      </div>
    {/each}

    {#if asking}
      <div class="flex items-start">
        <div class="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-400">
          Thinking...
        </div>
      </div>
    {/if}
  </main>

  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
    <div class="max-w-2xl mx-auto flex gap-2">
      <input
        bind:value={question}
        onkeydown={(e) => e.key === 'Enter' && askQuestion()}
        placeholder="Ask a question..."
        class="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition"
      />
      <button
        onclick={askQuestion}
        disabled={asking}
        class="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition disabled:opacity-40"
      >
        Ask
      </button>
    </div>
  </div>
</div>
