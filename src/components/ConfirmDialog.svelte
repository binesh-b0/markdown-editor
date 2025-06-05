<script lang="ts">
	export let message = '';
	export let onConfirm: (v: boolean) => void;
</script>

<div class="overlay">
	<div class="box">
		<div>{message}</div>
		<div>
			<button on:click={() => onConfirm(true)}>OK</button>
			<button on:click={() => onConfirm(false)}>Cancel</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}
	.box {
		background: var(--bg-light);
		border: 1px solid var(--border);
		padding: 1rem 1.5rem;
		border-radius: 6px;
		min-width: 240px;
		text-align: center;
	}
	html.dark .box {
		background: var(--bg-dark);
	}
	button {
		margin: 0.5rem;
		padding: 0.25rem 0.75rem;
		background: none;
		border: 1px solid var(--border);
		cursor: pointer;
	}
</style>
