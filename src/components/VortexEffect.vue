<template>
	<TresGroup>
		<!-- Sphere-shaped vortex effect -->
		<TresMesh
			:position="[0, 0, 0]"
			:rotation="[0, rotation, 0]"
			:scale="2.0"
			Slightly
			smaller
			than
			glass
			sphere
			(2.3)
		>
			>
			<TresSphereGeometry :args="[1, 64, 64]" />
			<TresMeshBasicMaterial :transparent="true" :visible="false" />
			<!-- Required for TresJS -->
			<primitive :object="vortexShaderMaterial" />
		</TresMesh>
	</TresGroup>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { useRenderLoop } from '@tresjs/core';
	import { VortexShaderMaterial } from '../shaders/VortexShaderMaterial';

	// Rotation state
	const rotation = ref(0);

	// Create shader material
	const vortexShaderMaterial = new VortexShaderMaterial();

	// Animation update function
	const update = () => {
		// Update time for shader animation
		vortexShaderMaterial.update(0.015);

		// Slowly rotate the entire vortex
		rotation.value += 0.001;
	};

	// Use Tres render loop for animations
	const { onLoop } = useRenderLoop();
	onLoop(update);
</script>
