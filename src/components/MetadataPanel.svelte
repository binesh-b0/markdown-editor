<script lang="ts">
	import { onMount } from 'svelte';
	import { markdownContent, markSaved } from '$lib/stores';
	import { parseFrontMatter, buildFrontMatter } from '$lib/utils';
	import { get } from 'svelte/store';

	export let closePanel: () => void;

	/* form fields */
	let title = '';
	let author = '';
	let date = '';
	let tags = '';

	/* ─── initial load: pull existing YAML (if any) ─── */
	onMount(() => {
		const parsed = parseFrontMatter(get(markdownContent));
		if (parsed) {
			const { meta, body } = parsed;
			title = (meta.title ?? '') as string;
			author = (meta.author ?? '') as string;
			date = (meta.date ?? '') as string;
			tags = Array.isArray(meta.tags) ? (meta.tags as string[]).join(', ') : (meta.tags ?? '');
			markdownContent.set(body); // buffer now holds *body only*
		}
	});

	/* ─── whenever any input changes, rebuild YAML once ─── */
	$: {
		/* turn "tag1, tag2" → ["tag1","tag2"] */
		const tagArr = tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);

		const yaml = buildFrontMatter({ title, author, date, tags: tagArr });
		const buf = get(markdownContent);
		const body = parseFrontMatter(buf)?.body ?? buf; // strip existing YAML if present
		const next = `${yaml}${body}`;

		if (next !== buf) {
			markdownContent.set(next);
			markSaved(next);
		}
	}
</script>

<div class="panel">
	<label>
		Title
		<input class="title" type="text" bind:value={title} />
	</label>
	<label>
		Author
		<input type="text" bind:value={author} />
	</label>
	<label>
		Date
		<input type="date" bind:value={date} />
	</label>
	<label>
		Tags (comma-separated)
		<input type="text" bind:value={tags} />
	</label>

	<button on:click={closePanel}>✓ Done</button>
</div>

<style>
	.panel {
		border-bottom: 1px solid var(--border);
		padding: 0.75rem 1rem;
		display: grid;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.02);
	}
	input {
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--border);
		background: inherit;
		color: inherit;
	}
	input.title {
		width: auto;
		display: inline-block;
		border: none;
		border-bottom: 1px solid var(--border);
	}
	button {
		justify-self: start;
		margin-top: 0.5rem;
		background: none;
		border: 1px solid var(--border);
		padding: 0.25rem 0.6rem;
		cursor: pointer;
	}
</style>
