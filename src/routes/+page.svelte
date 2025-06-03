<script lang="ts">
  import MarkdownEditor from '$components/MarkdownEditor.svelte';
  import MarkdownPreview from '$components/MarkdownPreview.svelte';
  import { theme } from '$lib/stores';

  /** flip between themes */
  function toggleTheme() {
    theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
</script>

<style>
  header {
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid var(--border);
    gap: 1rem;
  }
  header h1 {
    font-size: 1.1rem;
    flex: 1;
  }
  header button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.3rem;
    transition: transform var(--transition);
  }
  header button:hover {
    transform: scale(1.1);
  }
</style>

<header>
  <h1>MarkdownEditor (Phase 2)</h1>
  <button on:click={toggleTheme} title="Toggle light/dark">
    {#if $theme === 'light'}🌙{:else}🌞{/if}
  </button>
</header>

<div class="editor-layout">
  <div class="pane">
    <MarkdownEditor />
  </div>
  <div class="pane">
    <MarkdownPreview />
  </div>
</div>
