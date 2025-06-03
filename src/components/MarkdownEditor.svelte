<script lang="ts">
  import { markdownContent } from '$lib/stores';

  let textareaEl: HTMLTextAreaElement;
 
  function handleInput(e: Event) {
    markdownContent.set((e.target as HTMLTextAreaElement).value);
  }

 export function wrapSelection(prefix: string, suffix = prefix, placeholder = '') {
    const { selectionStart: s, selectionEnd: e, value } = textareaEl;
    const selected = value.slice(s, e) || placeholder;
    const updated  = value.slice(0, s) + prefix + selected + suffix + value.slice(e);
    textareaEl.value = updated;
    markdownContent.set(updated);

    const cursor = s + prefix.length + (selected === placeholder ? 0 : selected.length);
    textareaEl.focus();
    textareaEl.setSelectionRange(cursor, cursor);
  }

  export function insertAtCursor(text:string, cursorOffset = 0) {
    const {selectionStart:s, selectionEnd: e, value } = textareaEl;
    const updated = value.slice(0, s) + text + value.slice(e);
    textareaEl.value = updated;
    markdownContent.set(updated);
    const cursor = s + text.length + cursorOffset;
    textareaEl.focus();
    textareaEl.setSelectionRange(cursor, cursor);
  }
</script>

<!-- textarea automatically bound via store subscription -->
<textarea
  bind:this={textareaEl}
  bind:value={$markdownContent}
  on:input={handleInput}
  spellcheck="false"
  placeholder="# Start typing Markdown..."
></textarea>
