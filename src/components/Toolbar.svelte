<script lang="ts">
  import { theme, dirty } from '$lib/stores';

  /* handlers passed from +page */
  export let onOpen: () => void;
  export let onSave: () => void;
  export let fmt: Record<string, () => void>;
  export let showMetaPanel: () => void;

  /* kebab menu toggle */
  let menuOpen = false;
  let headOpen = false;

  function toggleTheme() {
    theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  .toolbar {
    display: flex;
    align-items: center;
    height: 52px;
    padding: 0 0.75rem;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
  }
  .toolbar button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background var(--transition);
  }
  .toolbar button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  html.dark .toolbar button:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .group-divider {
    width: 1px;
    height: 60%;
    background: var(--border);
    margin: 0 0.25rem;
  }
  .unsaved {
    margin-left: auto;
    color: #d9534f;
    font-style: italic;
  }
  html.dark .unsaved { color: #e07a5f; }

  /* kebab dropdown */
  .menu {
    position: relative;
  }
  .dropdown {
    position: absolute;
    right: 0;
    top: 130%;
    background: var(--bg-light);
    border: 1px solid var(--border);
    padding: 0.25rem 0;
    z-index: 10;
  }
  html.dark .dropdown { background: var(--bg-dark); }
  .dropdown button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.4rem 0.75rem;
  }
</style>

<div class="toolbar">
  <!-- File -->
  <button on:click={onOpen} title="Open (⌘‑O)">📂 Open</button>
  <button on:click={onSave} title="Save / Download (⌘‑S)">💾 Save</button>

  <div class="group-divider"></div>

  <!-- Formatting -->
  <button on:click={fmt.bold}    title="Bold **text** (⌘‑B)"><b>B</b></button>
  <button on:click={fmt.italic}  title="Italic _text_ (⌘‑I)"><i>I</i></button>
  <div class="menu">
    <button on:click={() => (headOpen = !headOpen)} title="Heading">H#</button>
    {#if headOpen}
      <div class="dropdown" on:mouseleave={() => (headOpen = false)} aria-label="Heading" role="menu" tabindex="-1">
        <button on:click={() => { headOpen = false; fmt.h1(); }}>H1</button>
        <button on:click={() => { headOpen = false; fmt.h2(); }}>H2</button>
        <button on:click={() => { headOpen = false; fmt.h3(); }}>H3</button>
        <button on:click={() => { headOpen = false; fmt.h4(); }}>H4</button>
        <button on:click={() => { headOpen = false; fmt.h5(); }}>H5</button>
        <button on:click={() => { headOpen = false; fmt.h6(); }}>H6</button>
      </div>
    {/if}
  </div>
  <button on:click={fmt.link}    title="Link [txt](url)">🔗</button>
  <button on:click={fmt.image}   title="Image ![alt](url)">🖼️</button>
  <button on:click={fmt.codeblk} title="Code block ```">⎇</button>
  <button on:click={fmt.inline}  title="Inline code `code`">⌘</button>
  <button on:click={fmt.ul}      title="• List">•</button>
  <button on:click={fmt.ol}      title="1. List">1.</button>
  <button on:click={fmt.quote}   title="> Quote">❝</button>
  <button on:click={fmt.hr}      title="Horizontal rule ---">—</button>

  <div class="group-divider"></div>

  <!-- Theme -->
  <button on:click={toggleTheme} title="Toggle theme">
    {#if $theme === 'light'}🌙{:else}🌞{/if}
  </button>

  <!-- kebab -->
  <div class="menu">
    <button on:click={() => (menuOpen = !menuOpen)} title="More">⋯</button>
    {#if menuOpen}
      <div class="dropdown" on:mouseleave={() => (menuOpen = false)} aria-label="More options" role="menu" tabindex="-1">
        <button on:click={() => { menuOpen = false; showMetaPanel(); }}>📝 Metadata</button>
      </div>
    {/if}
  </div>

  <!-- Dirty flag -->
  {#if $dirty}<span class="unsaved">Unsaved</span>{/if}
</div>
