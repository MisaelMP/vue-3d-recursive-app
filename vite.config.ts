import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { templateCompilerOptions } from '@tresjs/core';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	plugins: [
		vue({
			...templateCompilerOptions,
		}),
		glsl(),
	],
	assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.png', '**/*.jpg'],
});
