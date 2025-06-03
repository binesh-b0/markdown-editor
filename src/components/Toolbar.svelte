<script lang="ts">
  import { theme, dirty } from '$lib/stores';
  import { get } from 'svelte/store';

  /* callback props wired up in +page.svelte */
  export let onOpen: () => void;
  export let onSave: () => void;
  export let bold: () => void;
  export let italic: () => void;
  export let heading: () => void;
  export let link: () => void;
  export let image: () => void;
  export let codeblk: () => void;
  export let ul: () => void;
  export let ol: () => void;
  export let quote: () => void;
  export let hr: () => void;

  function toggleTheme() {
    theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  .toolbar {
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  button {
    font-size: 1rem;
    background: none;
    border: none;
    cursor: pointer;
  }
  .unsaved { margin-left: auto; font-style: italic; color: #d9534f; }
  html.dark .unsaved { color: #e07a5f; }
</style>

<div class="toolbar">
  <!-- file -->
  <button on:click={onOpen} title="Open">📂</button>
  <button on:click={onSave} title="Save">💾</button>
  <!-- formatting -->
  <button on:click={bold}    title="Bold"><b>B</b></button>
  <button on:click={italic}  title="Italic"><i>I</i></button>
  <button on:click={heading} title="Heading">H</button>
  <button on:click={link}    title="Link">🔗</button>
  <button on:click={image}   title="Image">🖼️</button>
  <button on:click={codeblk} title="Code">{"<>"}</button>
  <button on:click={ul}      title="Unordered list">•</button>
  <button on:click={ol}      title="Ordered list">1.</button>
  <button on:click={quote}   title="Quote">“</button>
  <button on:click={hr}      title="Horizontal rule">—</button>
  <!-- theme -->
  <button on:click={toggleTheme} title="Toggle theme">
    {#if $theme === 'light'}🌙{:else}🌞{/if}
  </button>

  <!-- unsaved marker -->
  {#if $dirty}<span class="unsaved">Unsaved</span>{/if}
</div>
