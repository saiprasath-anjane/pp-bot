<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-white flex items-center justify-center px-4">
  <div class="w-full max-w-sm">
    <div class="mb-8">
      <h1 class="text-xl font-semibold text-gray-900 tracking-tight">doc-bot admin</h1>
      <p class="text-sm text-gray-400 mt-1">Enter password to continue</p>
    </div>

    <form method="post" use:enhance class="flex flex-col gap-4">
      <input
        type="password"
        name="password"
        placeholder="Admin password"
        class="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition"
      />

      {#if form?.message}
        <p class="text-xs text-red-500">{form.message}</p>
      {/if}

      <button class="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition">
        Sign in
      </button>
    </form>
  </div>
</div>
