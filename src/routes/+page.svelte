<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { markdownContent, dirty } from '$lib/stores';
  import Toolbar        from '$components/Toolbar.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';
  import MarkdownPreview from '$components/MarkdownPreview.svelte';

  /* editor ref lets us access its exported functions */
  let editorRef: InstanceType<typeof MarkdownEditor>;

  /* ----- File‑System‑Access availability ----- */
  const hasNativeFS: boolean = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  /* ----- open file ----- */
  async function onOpen() {
    if (get(dirty) && !confirm('Unsaved changes will be lost. Continue?')) return;

    if (hasNativeFS) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown'] } }]
        });
        const file = await handle.getFile();
        markdownContent.set(await file.text());
        dirty.set(false);
      } catch { /* user cancelled */ }
    } else {
      hiddenInput.click();
    }
  }

  /* ----- save file ----- */
  async function onSave() {
    const txt = get(markdownContent);
    if (hasNativeFS) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'document.md',
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }]
        });
        const writer = await handle.createWritable();
        await writer.write(txt);
        await writer.close();
        dirty.set(false);
      } catch { /* cancelled */ }
    } else {
      const blob = new Blob([txt], { type: 'text/markdown' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'document.md'; a.click();
      URL.revokeObjectURL(url);
      dirty.set(false);
    }
  }

  /* ----- browser <input type=file> fallback ----- */
  let hiddenInput: HTMLInputElement;
  function handleFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    f.text().then((t) => {
      markdownContent.set(t);
      dirty.set(false);
      hiddenInput.value = '';          // reset chooser
    });
  }

  /* ----- load previous session on mount ----- */
  onMount(() => {
    const cached = localStorage.getItem('markdown-editor-content');
    if (cached && confirm('Load previous session?')) {
      markdownContent.set(cached);
      dirty.set(true);
    }

    /* warn on tab close if dirty */
    window.addEventListener('beforeunload', (e) => {
      if (get(dirty)) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  });

  /* ----- formatting helpers (forward to editor) ----- */
  const fmt = {
    bold:    () => editorRef.wrapSelection('**', '**', ''),
    italic:  () => editorRef.wrapSelection('_', '_', ''),
    heading: () => editorRef.wrapSelection('# ', '', ''),
    link:    () => editorRef.wrapSelection('[', '](https://)', 'text'),
    image:   () => editorRef.insertAtCursor('![alt](https://)', -8),
    code:    () => editorRef.wrapSelection('```\n', '\n```', 'code'),
    ul:      () => editorRef.wrapSelection('- ', '', 'item'),
    ol:      () => editorRef.wrapSelection('1. ', '', 'item'),
    quote:   () => editorRef.wrapSelection('> ', '', 'quote'),
    hr:      () => editorRef.insertAtCursor('\n---\n')
  };
</script>

<!-- hidden file input for fallback -->
<input
  type="file"
  accept=".md,.markdown,text/markdown"
  bind:this={hiddenInput}
  on:change={handleFile}
  style="display:none"
/>

<Toolbar
  onOpen={onOpen}
  onSave={onSave}
  bold={fmt.bold}
  italic={fmt.italic}
  heading={fmt.heading}
  link={fmt.link}
  image={fmt.image}
  codeblk={fmt.code}
  ul={fmt.ul}
  ol={fmt.ol}
  quote={fmt.quote}
  hr={fmt.hr}
/>

<!-- main layout -->
<div class="editor-layout">
  <div class="pane">
    <MarkdownEditor bind:this={editorRef} />
  </div>
  <div class="pane">
    <MarkdownPreview />
  </div>
</div>
