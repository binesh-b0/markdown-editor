<script lang="ts">
  import { htmlContent } from '$lib/stores';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function onHover(event: MouseEvent) {
    const el = (event.target as HTMLElement).closest('[data-line]');
    dispatch('highlight', { line: el ? Number(el.getAttribute('data-line')) : null });
  }

  function onClick(event: MouseEvent) {
    const el = (event.target as HTMLElement).closest('[data-line]');
    if (el) dispatch('jump', { line: Number(el.getAttribute('data-line')) });
  }
</script>

<div
  class="preview-content"
  on:mouseover={onHover}
  on:mouseleave={() => dispatch('highlight', { line: null })}
  on:click={onClick}
>
  {@html $htmlContent}
</div>