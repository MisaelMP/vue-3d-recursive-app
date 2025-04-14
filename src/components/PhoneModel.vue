<!-- File: src/components/PhoneModel.vue -->
<template>
	<TresGroup>
		<primitive :object="model" />

		<!-- Time Text -->
		<Text3D
			:text="currentTime"
			:position="[0, 1.1, 0.17]"
			:rotation="screenRotation"
			font="/fonts/helvetiker_regular.typeface.json"
			:size="0.1"
		/>

		<!-- Icons Group -->
		<TresGroup :position="screenPosition" :rotation="screenRotation">
			<TresMesh
				v-for="(icon, index) in icons"
				:key="icon.name"
				:position="[index * 0.4 - 0.4, 0.3, 0]"
				@click="() => handleIconClick(icon.url)"
			>
				<TresPlaneGeometry :args="[0.3, 0.3]" />
				<TresMeshBasicMaterial :map="icon.texture" tone-mapped="false" />
			</TresMesh>

			<!-- Zoom Button -->
			<TresMesh @click="handleAppClick" :position="[0, -0.3, 0.01]">
				<primitive :object="roundedBox" />
				<TresMeshStandardMaterial color="#2f84ff" />
			</TresMesh>

			<!-- Zoom Button Label -->
			<Text3D
				text="Open App"
				:position="[-0.33, -0.32, 0.04]"
				:size="0.07"
				:rotation="[0, 0, 0]"
				font="/fonts/helvetiker_regular.typeface.json"
			/>
		</TresGroup>
	</TresGroup>
</template>

<script setup lang="ts">
	import { useGLTF, Text3D } from '@tresjs/cientos';
	import { ref } from 'vue';
	import { TextureLoader } from 'three';
	import { RoundedBoxGeometry } from 'three-stdlib';
	import gsap from 'gsap';
	import * as THREE from 'three';
	import { Color } from 'three';
	import { useIntervalFn } from '@vueuse/core';

	const emit = defineEmits(['trigger-recursion']);
	const { scene: model } = await useGLTF('/models/phone.glb');

	const screenPosition = [0, 0.2, 0.17];
	const screenRotation = [-0.35, 0, 0];

	model.rotation.set(1.3, 4.7, 0);

	// brighten the screen TODO: make sure it works
	const screen = model.getObjectByName('Screen');
	if (screen && (screen as THREE.Mesh).material) {
		const material = (screen as THREE.Mesh)
			.material as THREE.MeshStandardMaterial;
		material.emissive = new Color('#ffffff');
		material.emissiveIntensity = 0.9;
	}

	const currentTime = ref('');

	const updateTime = () => {
		currentTime.value = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	updateTime();
	useIntervalFn(updateTime, 60000);

	const icons = ref([
		{
			name: 'PortfolioIcon',
			texture: new TextureLoader().load('/icons/Misael_Logo.svg'),
			url: 'https://misaelm.com',
		},
		{
			name: 'LinkedInIcon',
			texture: new TextureLoader().load('/icons/LinkedIn_icon.svg'),
			url: 'https://linkedin.com/in/yourprofile',
		},
	]);

	const roundedBox = new RoundedBoxGeometry(0.8, 0.3, 0.05, 4, 0.02);

	function handleIconClick(url: string) {
		window.open(url, '_blank');
	}

	function handleAppClick() {
		gsap.to(model.position, {
			z: -5,
			duration: 1,
			onComplete: () => {
				gsap.set(model.position, { z: 0 });
			},
		});
		emit('trigger-recursion');
	}
</script>
