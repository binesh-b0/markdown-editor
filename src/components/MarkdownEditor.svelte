<script lang="ts">
  import { markdownContent } from '$lib/stores';

  let textareaEl: HTMLTextAreaElement;

  function handleInput(e: Event) {
    markdownContent.set((e.target as HTMLTextAreaElement).value);
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
