// vitest.config.ts  ── root of the monorepo
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: ['./my-vue-app'], // <-— workspaces you want to test
		/* 1️⃣  keep or change the *test* reporter */
		reporters: ['default'], // 'default' | 'verbose' | 'dot' | …

		/* 2️⃣  configure coverage separately */
		coverage: {
			provider: 'istanbul', // or 'v8'
			reporter: ['text', 'lcov'],
			all: true, // include files that weren’t executed
			reportsDirectory: './test-results',
		},
	},
});
