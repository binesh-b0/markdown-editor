<script lang="ts">
	import { theme, dirty, editorSettings, showLineNumbers, fileName } from '$lib/stores';

	/* handlers passed from +page */
	export let onOpen: () => void;
	export let onSave: () => void;
	export let fmt: Record<string, () => void>;
	export let showMetaPanel: () => void;

	/* menu toggle flags */
	let menuOpen = false;
	let headOpen = false;
	let advOpen = false;

	// width of filename input adapts to content length
	$: size = Math.max($fileName.length, 1);

	function toggleTheme() {
		theme.update((t) => (t === 'light' ? 'dark' : 'light'));
	}

	function toggleLines() {
		editorSettings.update((s) => ({ ...s, showLineNumbers: !s.showLineNumbers }));
	}
</script>

<div class="toolbar" role="toolbar" aria-label="Editor toolbar">
	<!-- File -->
	<button on:click={onOpen} title="Open (⌘-O)" aria-label="Open file">📂 Open</button>
	<button on:click={onSave} title="Download (⌘-S)" aria-label="Download file">💾 Download</button>
	<input
		class="filename"
		type="text"
		bind:value={$fileName}
		aria-label="File name"
		placeholder="Untitled"
		{size}
	/>

	<div class="group-divider"></div>

	<!-- Formatting -->
	<button on:click={fmt.bold} title="Bold **text** (⌘‑B)"><b>B</b></button>
	<button on:click={fmt.italic} title="Italic _text_ (⌘‑I)"><i>I</i></button>
	<div class="menu">
		<button on:click={() => (headOpen = !headOpen)} title="Heading">H#</button>
		{#if headOpen}
			<div
				class="dropdown"
				on:mouseleave={() => (headOpen = false)}
				aria-label="Heading"
				role="menu"
				tabindex="-1"
			>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h1();
					}}>H1</button
				>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h2();
					}}>H2</button
				>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h3();
					}}>H3</button
				>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h4();
					}}>H4</button
				>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h5();
					}}>H5</button
				>
				<button
					on:click={() => {
						headOpen = false;
						fmt.h6();
					}}>H6</button
				>
			</div>
		{/if}
	</div>
	<button on:click={fmt.link} title="Link [txt](url)">🔗</button>
	<button on:click={fmt.image} title="Image ![alt](url)">🖼️</button>
	<button on:click={fmt.codeblk} title="Code block ```">⎇</button>
	<button on:click={fmt.inline} title="Inline code `code`">⌘</button>
	<button on:click={fmt.ul} title="• List">•</button>
	<button on:click={fmt.ol} title="1. List">1.</button>
	<button on:click={fmt.quote} title="> Quote">❝</button>
	<button on:click={fmt.hr} title="Horizontal rule ---">—</button>
	<div class="menu">
		<button
			on:click={() => (advOpen = !advOpen)}
			class="advanced-btn"
			aria-haspopup="true"
			aria-expanded={advOpen}
			aria-label="Advanced formatting">Advanced ▾</button
		>
		{#if advOpen}
			<div
				class="dropdown"
				on:mouseleave={() => (advOpen = false)}
				aria-label="Advanced"
				role="menu"
				tabindex="-1"
			>
				<button
					on:click={() => {
						advOpen = false;
						fmt.strike();
					}}>~~strike~~</button
				>
				<button
					on:click={() => {
						advOpen = false;
						fmt.table();
					}}>table</button
				>
				<button
					on:click={() => {
						advOpen = false;
						fmt.footnote();
					}}>footnote</button
				>
			</div>
		{/if}
	</div>

	<div class="group-divider"></div>

	<!-- Theme -->
	<button on:click={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
		{#if $theme === 'light'}🌙{:else}🌞{/if}
	</button>
	<button
		on:click={toggleLines}
		class="line-toggle"
		aria-label="Toggle line numbers"
		aria-pressed={$showLineNumbers}
	>
		{#if $showLineNumbers}Hide line numbers{:else}Show line numbers{/if}
	</button>

	<!-- kebab -->
	<div class="menu">
		<button on:click={() => (menuOpen = !menuOpen)} title="More">⋯</button>
		{#if menuOpen}
			<div
				class="dropdown"
				on:mouseleave={() => (menuOpen = false)}
				aria-label="More options"
				role="menu"
				tabindex="-1"
			>
				<button
					on:click={() => {
						menuOpen = false;
						showMetaPanel();
					}}>📝 Metadata</button
				>
			</div>
		{/if}
	</div>

	<!-- Dirty flag -->
	{#if $dirty}
		<span
			class="unsaved-dot"
			aria-label="Unsaved changes"
			title="Unsaved changes"
			aria-live="polite"
		></span>
	{/if}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	.toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		height: auto;
		padding: 0.25rem 0.5rem;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		background: linear-gradient(135deg, var(--bg-light), #f0f0f7);
		border-radius: var(--radius) var(--radius) 0 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	html.dark .toolbar {
		background: linear-gradient(135deg, #2b2b2b, #363636);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	.toolbar button {
		background: none;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius);
		transition: background var(--transition);
	}
	.line-toggle,
	.advanced-btn {
		font-size: 0.9rem;
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
	.filename {
		flex: none;
		min-width: 0;
		padding: 0.25rem 0.5rem;
		border: none;
		background: inherit;
		color: inherit;
	}
	.filename:focus {
		outline: none;
		border-bottom: 1px solid var(--border);
	}
	.unsaved-dot {
		margin-left: auto;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: #d9534f;
	}
	html.dark .unsaved-dot {
		background: #e07a5f;
	}

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
	html.dark .dropdown {
		background: var(--bg-dark);
	}
	.dropdown button {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.4rem 0.75rem;
	}
	@media (max-width: 600px) {
		.toolbar {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}
		.group-divider {
			width: 100%;
			height: 1px;
			margin: 0.25rem 0;
		}
		.unsaved-dot {
			align-self: flex-end;
			margin-left: 0;
		}
	}
</style>
