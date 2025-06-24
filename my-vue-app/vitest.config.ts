import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	// root: __dirname, // <- important for source-map paths
	plugins: [vue()],

	test: {
		environment: 'jsdom',
		globals: true,
		includeSource: ['src/**/*.{js,ts,vue}'], // ensures instrumentation
		coverage: {
			// do NOT redeclare provider here
			reportsDirectory: '../test-results/ui', // keep reports tidy
		},
	},
});
