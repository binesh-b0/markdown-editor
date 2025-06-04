<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { markdownContent, dirty, markSaved } from '$lib/stores';
  import Toolbar from '$components/Toolbar.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';
  import MarkdownPreview from '$components/MarkdownPreview.svelte';
  import MetadataPanel from '$components/MetadataPanel.svelte';
  import ConfirmDialog from '$components/ConfirmDialog.svelte';

  /* refs */
  let editorRef: InstanceType<typeof MarkdownEditor>;
  let hiddenInput: HTMLInputElement;
  let showMeta = false;
  let confirmMsg = '';
  let confirmResolve: (v: boolean) => void = () => {};

  function ask(msg: string): Promise<boolean> {
    confirmMsg = msg;
    return new Promise((res) => {
      confirmResolve = res;
    });
  }

  function handleConfirm(val: boolean) {
    confirmMsg = '';
    confirmResolve(val);
  }

  const hasNativeFS = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  /* ---------------- File Open / Save ---------------- */

  async function onOpen() {
    if (get(dirty) && !(await ask('You have unsaved work. Continue?'))) return;
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
function bullets(prefix: string, ordered = false) {
  const el = editorRef;             // textarea wrapper component
  const ta = (el as any).$$.ctx[0]; // raw <textarea> element
  const { value, selectionStart: s, selectionEnd: e } = ta;

  // Grab the selected block (or current line if nothing selected)
  const startLine = value.lastIndexOf('\n', s - 1) + 1;
  let endLine = value.indexOf('\n', e);
  if (endLine === -1) endLine = value.length;
  const block  = value.slice(startLine, endLine);
  const lines  = block.split('\n');

  const patched = lines
    .map((ln: string, i: number) => {
      const indent = ln.match(/^\s*/)?.[0] ?? '';
      let text = ln.slice(indent.length);

      if (ordered) {
        const match = text.match(/^\d+\.\s+/);
        if (match) {
          // toggle off existing numbered list
          text = text.slice(match[0].length);
        } else {
          text = `${i + 1}. ${text}`;
        }
      } else {
        if (text.startsWith(prefix.trim())) {
          text = text.slice(prefix.trim().length);
        } else {
          text = prefix + text;
        }
      }

      return indent + text;
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

  function isInCodeBlock(pos: number) {
    const ta = (editorRef as any).$$.ctx[0] as HTMLTextAreaElement;
    const before = ta.value.slice(0, pos);
    const fences = (before.match(/```/g) || []).length;
    return fences % 2 === 1;
  }

  function safeWrap(p: string, sfx = p) {
    const ta = (editorRef as any).$$.ctx[0] as HTMLTextAreaElement;
    if (isInCodeBlock(ta.selectionStart)) {
      ask('Cannot format text inside a code block');
      return;
    }
    editorRef.wrapSelection(p, sfx, '');
  }

  function heading(level: number) {
    const ta = (editorRef as any).$$.ctx[0] as HTMLTextAreaElement;
    const { value, selectionStart: s, selectionEnd: e } = ta;
    const startLine = value.lastIndexOf('\n', s - 1) + 1;
    let endLine = value.indexOf('\n', e);
    if (endLine === -1) endLine = value.length;
    const lines = value.slice(startLine, endLine).split('\n');
    const prefix = '#'.repeat(level) + ' ';

    const patched = lines
      .map((ln) => {
        const stripped = ln.replace(/^#+\s+/, '');
        if (ln.trim().startsWith(prefix)) return stripped;
        return prefix + stripped;
      })
      .join('\n');

    const next = value.slice(0, startLine) + patched + value.slice(endLine);
    ta.value = next;
    markdownContent.set(next);
    const newEnd = startLine + patched.length;
    ta.setSelectionRange(newEnd, newEnd);
    ta.focus();
  }

  const fmt = {
    bold:    () => safeWrap('**', '**'),
    italic:  () => safeWrap('_', '_'),
    h1:      () => heading(1),
    h2:      () => heading(2),
    h3:      () => heading(3),
    h4:      () => heading(4),
    h5:      () => heading(5),
    h6:      () => heading(6),
    link:    () => editorRef.wrapSelection('[', '](https://)', ''),
    image:   () => editorRef.insertAtCursor('![alt](https://)', ),
    codeblk: () => editorRef.wrapSelection('```\n', '\n```', ''),
    inline:  () => editorRef.wrapSelection('`', '`', 'code'),
    ul:      () => bullets('- '),
    ol:      () => bullets('1. ', true),
    quote:   () => editorRef.wrapSelection('> ', '', ''),
    hr:      () => editorRef.insertAtCursor('\n---\n')
  };

  /* ---------------- session restore ---------------- */

  onMount(() => {
    const cached = localStorage.getItem('markdown-editor-content');
    if (cached) {
      ask('Load previous session?').then((ok) => {
        if (ok) markdownContent.set(cached);
      });
    }

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
{#if confirmMsg}
  <ConfirmDialog message={confirmMsg} onConfirm={handleConfirm} />
{/if}
