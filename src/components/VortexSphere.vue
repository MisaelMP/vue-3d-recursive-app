<template>
	<TresGroup>
		<!-- Glass sphere using standard Three.js -->
		<TresMesh
			:position="[0, 0, 0]"
			:scale="2.3"
			cast-shadow
			receive-shadow
			ref="sphereRef"
		>
			<TresSphereGeometry :args="[1, 64, 64]" />
			<TresMeshPhysicalMaterial
				:color="0xffffff"
				:metalness="0.0"
				:roughness="0.0"
				:ior="1.5"
				:thickness="0.2"
				:clearcoat="0.5"
				:envMapIntensity="1.5"
				:transmission="1.0"
				:specularIntensity="0.8"
				:specularColor="0xffffff"
				:opacity="0.9"
				:side="DoubleSide"
				:transparent="true"
				:attenuationColor="0xffffff"
				:attenuationDistance="10"
			/>
		</TresMesh>

		<!-- Inner glow sphere -->
		<TresMesh :position="[0, 0, 0]" :scale="2.0">
			<TresSphereGeometry :args="[1, 32, 32]" />
			<TresMeshBasicMaterial
				:color="sphereGlowColor"
				:transparent="true"
				:opacity="0.08"
			/>
		</TresMesh>
	</TresGroup>
</template>

<script setup lang="ts">
	import { ref, inject, computed } from 'vue';
	import { DoubleSide, Color } from 'three';
	import { useRenderLoop } from '@tresjs/core';
	import type { Object3D, Scene } from 'three';

	const sphereRef = ref<Object3D | null>(null);
	const scene = inject<Scene | null>('scene', null);

	// Dynamic glow color
	const glowHue = ref(0.55); // Start with blue
	const sphereGlowColor = computed(() => {
		const color = new Color();
		color.setHSL(glowHue.value, 0.8, 0.5);
		return color;
	});

	// Update function to animate rotation and color
	const update = () => {
		// Animate glass sphere rotation
		if (scene && sphereRef.value && sphereRef.value.rotation) {
			sphereRef.value.rotation.y += 0.005;
			sphereRef.value.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
		}

		// Slowly cycle glow color
		glowHue.value = (glowHue.value + 0.001) % 1;
	};

	// Use Tres render loop for animations
	const { onLoop } = useRenderLoop();
	onLoop(update);
</script>
