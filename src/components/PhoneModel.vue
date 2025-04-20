<!-- File: src/components/PhoneModel.vue -->
<template>
	<TresGroup>
		<primitive :object="model" />

		<!-- Shadow-casting light -->
		<TresDirectionalLight
			:position="[5, 5, 5]"
			:intensity="1.5"
			:cast-shadow="true"
			shadow-mapSize-width="1024"
			shadow-mapSize-height="1024"
		/>
		<TresGroup :position="[0, 0, -0.1]">
			<VortexEffect />
		</TresGroup>
		<!-- Icons Group - adjusted position to fit on the screen -->
		<TresGroup :position="screenPosition" :rotation="screenRotation">
			<!-- Time Text - positioned at top center -->
			<primitive
				:object="timePlane"
				:position="[0, 0.6, 0.01]"
				:scale="[0.4, 0.1, 1]"
			/>

			<!-- Icons positioned in a better layout -->
			<TresMesh
				v-for="(icon, index) in icons"
				:key="icon.name"
				:position="[(index * 2 - 0.5) * 0.2, 0.2, 0.01]"
				@click="() => handleIconClick(icon.url)"
			>
				<TresPlaneGeometry :args="[0.18, 0.18]" />
				<TresMeshBasicMaterial :map="icon.texture" :tone-mapped="false" />
			</TresMesh>

			<!-- Zoom Button - positioned at bottom center -->
			<TresMesh @click="handleAppClick" :position="[0, -0.5, 0.01]">
				<primitive :object="roundedBox" />
				<TresMeshStandardMaterial color="#2f84ff" />
			</TresMesh>

			<!-- OpenButton Label - positioned directly on button -->
			<Text3D
				text="Open"
				:position="[0, -0.5, 0]"
				:size="0.05"
				:height="0.01"
				:rotation="[0, 0, 0]"
				font="/fonts/helvetiker_regular.typeface.json"
				cast-shadow
				receive-shadow
			>
				<TresMeshStandardMaterial
					color="red"
					:metalness="0.5"
					:roughness="0.5"
				/>
			</Text3D>
		</TresGroup>
	</TresGroup>
</template>

<script setup lang="ts">
	import { useGLTF, Text3D } from '@tresjs/cientos';
	import { ref } from 'vue';
	import { RoundedBoxGeometry } from 'three-stdlib';
	import gsap from 'gsap';
	import * as THREE from 'three';
	import { Color } from 'three';
	import { useIntervalFn } from '@vueuse/core';
	import VortexEffect from './VortexEffect.vue';

	const { scene: model } = await useGLTF('/models/iphone-empty.glb');

	// Phone position
	model.position.set(0.25, -4.5, 1);
	model.rotation.set(-0.15, 1.6, 0);
	model.scale.set(1, 1, 1);

	// Enable shadows on the phone model
	model.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.castShadow = true;
		}
	});

	// Carefully position the screen content to match the phone's screen
	const screenPosition: [number, number, number] = [0, 0.15, -0.2];
	const screenRotation: [number, number, number] = [-0.15, 0, 0];

	// brighten the screen, but reduce intensity for less reflection
	const screen = model.getObjectByName('Screen');
	if (screen && (screen as THREE.Mesh).material) {
		const material = (screen as THREE.Mesh)
			.material as THREE.MeshStandardMaterial;
		material.emissive = new Color('#ffffff');
		material.emissiveIntensity = 0.5;
	}

	// Create canvas-based texture for time
	function createTimeTexture(text: string): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 64;
		const ctx = canvas.getContext('2d')!;

		// Clear with transparent background
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw time text
		ctx.font = 'bold 42px Arial';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.fillText(text, canvas.width / 2, 42);

		return new THREE.CanvasTexture(canvas);
	}

	const timeTexture = ref<THREE.CanvasTexture>(createTimeTexture('00:00'));

	const timePlane = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 1),
		new THREE.MeshBasicMaterial({
			map: timeTexture.value,
			transparent: true,
			opacity: 0.9,
		})
	);

	const updateTimeTexture = () => {
		const now = new Date();
		const timeStr = now.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
		timeTexture.value = createTimeTexture(timeStr);
		timePlane.material.map = timeTexture.value;
		timePlane.material.needsUpdate = true;
	};

	updateTimeTexture();
	useIntervalFn(updateTimeTexture, 60000);

	const icons = ref([
		{
			name: 'PortfolioIcon',
			texture: new THREE.TextureLoader().load('/icons/Misael_Logo.svg'),
			url: 'https://misaelm.com',
		},
		{
			name: 'LinkedInIcon',
			texture: new THREE.TextureLoader().load('/icons/LinkedIn_icon.svg'),
			url: 'https://linkedin.com/in/yourprofile',
		},
	]);

	// Make the rounded button slightly smaller
	const roundedBox = new RoundedBoxGeometry(0.5, 0.2, 0.05, 4, 0.02);

	function handleIconClick(url: string) {
		window.open(url, '_blank');
	}

	function handleAppClick() {
		// Just animate the phone without triggering recursion
		gsap.to(model.position, {
			z: -5,
			duration: 1,
			onComplete: () => {
				gsap.set(model.position, { z: 0 });
			},
		});
	}
</script>
