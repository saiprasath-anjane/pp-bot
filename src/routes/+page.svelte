<script lang="ts">
  let urlsInput = $state('');
  let maxPages = $state(20);
  let crawling = $state(false);
  let result = $state<{ jobId: string; pagesProcessed: number } | null>(null);
  let error = $state('');
  let extraDomainsInput = $state('');
  let jobs = $state<{ id: string; baseUrl: string; status: string; pagesFound: number; createdAt: string }[]>([]);

  async function loadJobs() {
    const res = await fetch('/api/jobs');
    jobs = await res.json();
  }

  async function deleteJob(jobId: string) {
    await fetch(`/api/jobs?jobId=${jobId}`, { method: 'DELETE' });
    await loadJobs();
  }
  
  $effect(() => {
    loadJobs();
  });

  async function startCrawl() {
    const urls = urlsInput
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    const extraDomains = extraDomainsInput
    .split('\n')
    .map(d => d.trim())
    .filter(Boolean);

    crawling = true;
    error = '';
    result = null;

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, maxPages, extraDomains })
      });
      const data = await res.json();
      if (data.error) {
        error = data.error;
      } else {
        result = data;
        await loadJobs();
      }
    } catch (e) {
      error = 'Crawl failed. Check server logs.';
    } finally {
      crawling = false;
    }
  }
</script>

<div class="min-h-screen bg-white font-sans flex">
  <!-- Main content -->
  <div class="flex-1 flex flex-col">
    <header class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-gray-900">doc-bot</h1>
        <p class="text-xs text-gray-400">Admin — crawl documentation sites</p>
      </div>
      <form method="post" action="?/signOut">
        <button class="text-sm px-4 py-2 text-gray-400 hover:text-gray-600 transition">
          Sign out
        </button>
      </form>
    </header>

    <main class="max-w-xl mx-auto w-full px-4 py-10 flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Base URLs (one per line)</label>
        <textarea
          bind:value={urlsInput}
          rows="5"
          placeholder="https://docs.example.com&#10;https://help.example.com"
          class="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition resize-none font-mono"
        ></textarea>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Max pages per crawl</label>
        <input
          type="number"
          bind:value={maxPages}
          class="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition w-32"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Allowed extra domains (optional, one per line)</label>
        <textarea
          bind:value={extraDomainsInput}
          rows="2"
          placeholder="m2pfintech.com&#10;transcorpintl.com"
          class="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition resize-none font-mono"
        ></textarea>
        <p class="text-xs text-gray-400">Links to these domains found inside crawled pages will also be followed.</p>
      </div>

      <button
        onclick={startCrawl}
        disabled={crawling}
        class="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition disabled:opacity-40 w-fit"
      >
        {crawling ? 'Crawling...' : 'Start Crawl'}
      </button>

      {#if crawling}
        <p class="text-xs text-gray-400">This can take a while depending on max pages. Check terminal for live progress.</p>
      {/if}

      {#if result}
        <div class="text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          ✓ Crawled {result.pagesProcessed} pages successfully.
        </div>
      {/if}

      {#if error}
        <div class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      {/if}
    </main>
  </div>

  <!-- Sidebar: Crawl History -->
  <aside class="w-80 shrink-0 border-l border-gray-100 h-screen sticky top-0 flex flex-col">
    <div class="px-4 py-4 border-b border-gray-100">
      <p class="text-xs text-gray-500 font-medium">Crawl History</p>
    </div>
    <div class="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
      {#if jobs.length === 0}
        <p class="text-xs text-gray-400">No crawls yet.</p>
      {/if}
      {#each jobs as job}
        <div class="flex items-center gap-3 px-3 py-2.5 border border-gray-100 rounded-lg text-sm">
          <span
            class="w-2 h-2 rounded-full shrink-0 {job.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'}"
            title={job.status === 'done' ? 'Crawl completed successfully' : 'Crawl in progress or pending'}
          ></span>

          <div class="flex flex-col flex-1 min-w-0">
            <span class="text-gray-700 truncate text-xs">{job.baseUrl}</span>
            <span class="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()} · {job.pagesFound} pages</span>
          </div>

          <button
            onclick={() => deleteJob(job.id)}
            class="text-xs text-red-400 hover:text-red-600 transition shrink-0"
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  </aside>
</div>
