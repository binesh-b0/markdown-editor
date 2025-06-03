import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias:{
			$lib: 'src/lib',
			$components: 'src/components',
			$stores: 'src/stores',
			$utils: 'src/utils',
			$assets: 'src/assets',
			$routes: 'src/routes',
			$styles: 'src/styles',
			$icons: 'src/icons',
			$hooks: 'src/hooks',
			$types: 'src/types',
			$services: 'src/services',
			$api: 'src/api',
			$tests: 'src/tests',
			$constants: 'src/constants',
			$helpers: 'src/helpers',
			$plugins: 'src/plugins',
			$theme: 'src/theme',
		}
	}
};

export default config;
