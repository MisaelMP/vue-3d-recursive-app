<template>
	<TresGroup>
		<!-- Sphere-shaped vortex effect -->
		<TresMesh :position="[0, 0, 0]" :scale="[0.95, 0.95, 0.95]">
			<TresSphereGeometry :args="[1, 32, 32]" />
			<primitive :object="vortexShaderMaterial" />
		</TresMesh>
	</TresGroup>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useRenderLoop } from '@tresjs/core';
	import { VortexShaderMaterial } from '../shaders/VortexShaderMaterial';

	const vortexShaderMaterial = new VortexShaderMaterial();

	// Initialize shader with default values
	onMounted(() => {
		vortexShaderMaterial.setSpeed(0.4);
		vortexShaderMaterial.setStrength(1.0);
		vortexShaderMaterial.setBrightness(1.1);
		vortexShaderMaterial.setOpacity(0.7);
	});

	// Update shader on each frame
	const { onLoop } = useRenderLoop();
	onLoop(({ delta }) => {
		vortexShaderMaterial.update(delta);
	});
</script>
