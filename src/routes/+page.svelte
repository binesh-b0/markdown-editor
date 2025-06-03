<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { markdownContent, dirty, markSaved } from '$lib/stores';
  import Toolbar from '$components/Toolbar.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';
  import MarkdownPreview from '$components/MarkdownPreview.svelte';
  import MetadataPanel from '$components/MetadataPanel.svelte';

  /* refs */
  let editorRef: InstanceType<typeof MarkdownEditor>;
  let hiddenInput: HTMLInputElement;
  let showMeta = false;

  const hasNativeFS = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  /* ---------------- File Open / Save ---------------- */

  async function onOpen() {
    if (get(dirty) && !confirm('You have unsaved work. Continue?')) return;
    if (hasNativeFS) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }]
        });
        const file = await handle.getFile();
        const text = await file.text();
        markdownContent.set(text);
        markSaved(text);
      } catch {}
    } else hiddenInput.click();
  }

  async function onSave() {
    const txt = get(markdownContent);
    if (hasNativeFS) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'document.md',
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }]
        });
        const w = await handle.createWritable();
        await w.write(txt);
        await w.close();
        markSaved(txt);
      } catch {}
    } else {
      const blob = new Blob([txt], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'document.md'; a.click();
      URL.revokeObjectURL(url);
      markSaved(txt);
    }
  }

  function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      markdownContent.set(txt);
      markSaved(txt);
      hiddenInput.value = '';
    });
  }
/* --- Ordered & Unordered list helpers --- */
function bullets(prefix: string) {
  const el = editorRef;             // textarea wrapper component
  const ta = (el as any).$$.ctx[0]; // raw <textarea> element
  const { value, selectionStart: s, selectionEnd: e } = ta;

  // Grab the selected block (or current line if nothing selected)
  const startLine = value.lastIndexOf('\n', s - 1) + 1;
  const endLine   = e < value.length ? value.indexOf('\n', e) : value.length;
  const block     = value.slice(startLine, endLine);
  const lines     = block.split('\n');

  const patched = lines
    .map((ln: string, i: number) => {
      // If the line already starts with the prefix, toggle it off
      if (ln.trimStart().startsWith(prefix.trim())) return ln.replace(prefix, '');
      // For OL we increment numbers; for UL we reuse the prefix
      return prefix.includes('1.') ? `${i + 1}. ${ln}` : `${prefix}${ln}`;
    })
    .join('\n');

  const next = value.slice(0, startLine) + patched + value.slice(endLine);
  ta.value = next;
  markdownContent.set(next);

  // keep selection
  const newEnd = startLine + patched.length;
  ta.setSelectionRange(startLine, newEnd);
  ta.focus();
}


  /* ---------------- Formatting helpers ---------------- */

  const fmt = {
    bold:    () => editorRef.wrapSelection('**', '**', ''),
    italic:  () => editorRef.wrapSelection('_', '_', ''),
    heading: () => editorRef.wrapSelection('# ', '', ''),
    link:    () => editorRef.wrapSelection('[', '](https://)', ''),
    image:   () => editorRef.insertAtCursor('![alt](https://)', ),
    codeblk: () => editorRef.wrapSelection('```\n', '\n```', ''),
    inline:  () => editorRef.wrapSelection('`', '`', 'code'),
    ul:      () => editorRef.wrapSelection('- ', '', ''),
    ol:      () => editorRef.wrapSelection('1. ', '', ''),
    quote:   () => editorRef.wrapSelection('> ', '', ''),
    hr:      () => editorRef.insertAtCursor('\n---\n')
  };

  /* ---------------- session restore ---------------- */

  onMount(() => {
    const cached = localStorage.getItem('markdown-editor-content');
    if (cached && confirm('Load previous session?')) markdownContent.set(cached);

    window.addEventListener('beforeunload', (e) => {
      if (get(dirty)) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  });
</script>

<!-- hidden input fallback -->
<input
  type="file"
  accept=".md,.markdown,text/markdown"
  bind:this={hiddenInput}
  on:change={handleFile}
  style="display:none"
/>

<!-- optional metadata panel -->
{#if showMeta}
  <MetadataPanel closePanel={() => (showMeta = false)} />
{/if}

<Toolbar
  onOpen={onOpen}
  onSave={onSave}
  fmt={fmt}
  showMetaPanel={() => (showMeta = !showMeta)}
/>

<div class="editor-layout">
  <div class="pane">
    <MarkdownEditor bind:this={editorRef} />
  </div>
  <div class="pane">
    <MarkdownPreview />
  </div>
</div>
