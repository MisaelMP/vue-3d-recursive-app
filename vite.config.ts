import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { templateCompilerOptions } from '@tresjs/core';
import glsl from 'vite-plugin-glsl';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Merge configurations
export default defineConfig({
	plugins: [
		vue({
			...templateCompilerOptions,
		}),
		glsl(),
	],
	assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.png', '**/*.jpg'],
	...defineVitestConfig({
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: ['./test/setup.ts'],
		},
	}),
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		// Ignore TypeScript errors during build
		typescript: {
			ignoreBuildErrors: true,
		},
	},
});
