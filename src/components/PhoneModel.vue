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
		<!-- Conditionally render VortexEffect -->
		<TresGroup :position="[0, 0, -0.1]" v-if="showVortex">
			<VortexEffect />
		</TresGroup>
		<!-- Icons Group - adjusted position to fit on the screen -->
		<TresGroup :position="screenPosition" :rotation="screenRotation">
			<!-- Time Text - positioned at top center -->
			<primitive
				:object="timePlane"
				:position="[0, 0.6, 0.05]"
				:scale="[0.4, 0.1, 1]"
			/>

			<!-- Icons positioned in a better layout -->
			<TresMesh
				v-for="(icon, index) in icons"
				:key="icon.name"
				:position="[(index * 2 - 0.5) * 0.2, 0.2, 0.05]"
				:ref="
					(el) => {
						if (el) iconRefs[index] = el;
					}
				"
				@click="() => handleIconClick(icon.url, index)"
			>
				<TresPlaneGeometry :args="[0.18, 0.18]" />
				<TresMeshBasicMaterial
					:map="icon.texture"
					:tone-mapped="false"
					:depth-test="false"
				/>
			</TresMesh>

			<!-- Button with texture-based text -->
			<TresMesh
				ref="buttonRef"
				data-button="true"
				@click="handleAppClick"
				:position="[0, -0.5, 0.05]"
			>
				<TresPlaneGeometry :args="[0.5, 0.2]" />
				<TresMeshBasicMaterial
					:map="buttonTexture"
					:transparent="true"
					:tone-mapped="false"
					:depth-test="false"
				/>
			</TresMesh>
		</TresGroup>
	</TresGroup>
</template>

<script setup lang="ts">
	import { useGLTF } from '@tresjs/cientos';
	import { ref, reactive, watch } from 'vue';
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

	// State for conditional rendering and animations
	const showVortex = ref(false);
	const buttonColour = ref('#2f84ff');
	const buttonColourText = ref('white');
	const buttonText = ref('Open');
	const buttonRef = ref<THREE.Mesh | null>(null);
	const iconRefs = reactive<Record<number, THREE.Mesh>>({});

	// Type guard for THREE.Mesh
	const isMesh = (obj: unknown): obj is THREE.Mesh => {
		return obj instanceof THREE.Mesh;
	};

	// Helper function to safely access mesh properties
	const getMeshMaterial = (
		mesh: THREE.Mesh | null
	): THREE.MeshBasicMaterial | null => {
		if (!mesh?.material) return null;
		return mesh.material as THREE.MeshBasicMaterial;
	};

	// Create canvas-based texture for time
	function createTimeTexture(text: string): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 64;
		const ctx = canvas.getContext('2d')!;

		// Clear with transparent background
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw time text
		ctx.font = 'bold 56px Arial';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		ctx.fillText(text, canvas.width / 2, 56);

		return new THREE.CanvasTexture(canvas);
	}

	const timeTexture = ref<THREE.CanvasTexture>(createTimeTexture('00:00'));

	const timePlane = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 1),
		new THREE.MeshBasicMaterial({
			map: timeTexture.value,
			transparent: true,
			opacity: 1.0,
			depthTest: false,
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
			url: 'https://www.linkedin.com/in/misael-mercado/',
		},
	]);

	const handleIconClick = (url: string, index: number) => {
		// Animate the icon scale
		const iconMesh = iconRefs[index] as THREE.Mesh;
		if (iconMesh && iconMesh.scale) {
			// Simple pulse animation
			gsap.to(iconMesh.scale, {
				x: 1.2,
				y: 1.2,
				z: 1.2,
				duration: 0.2,
				ease: 'back.out',
				onComplete: () => {
					gsap.to(iconMesh.scale, {
						x: 1,
						y: 1,
						z: 1,
						duration: 0.2,
					});
				},
			});
		}

		window.open(url, '_blank');
	};

	// Create button with text
	const createTextTexture = (text: string): THREE.CanvasTexture => {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 128;
		const ctx = canvas.getContext('2d')!;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw button background with stronger opacity
		ctx.fillStyle = buttonColour.value;
		ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
		ctx.fill();

		ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
		ctx.stroke();

		// Draw text
		ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = buttonColourText.value;
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);

		return new THREE.CanvasTexture(canvas);
	};

	const buttonTexture = ref<THREE.CanvasTexture>(createTextTexture('Open'));

	// Update button texture when text changes
	watch(buttonText, (newText) => {
		buttonTexture.value = createTextTexture(newText);
		const material = getMeshMaterial(buttonRef.value);
		if (material) {
			material.map = buttonTexture.value;
			material.needsUpdate = true;
		}
	});

	// Update button texture when color changes
	watch(buttonColour, () => {
		buttonTexture.value = createTextTexture(buttonText.value);
		const material = getMeshMaterial(buttonRef.value);
		if (material) {
			material.map = buttonTexture.value;
			material.needsUpdate = true;
		}
	});

	const handleAppClick = () => {
		// Toggle vortex visibility
		showVortex.value = !showVortex.value;
		buttonText.value = showVortex.value ? 'Close' : 'Open';
		buttonColour.value = showVortex.value ? '#ff5252' : '#2f84ff';
		buttonColourText.value = showVortex.value ? 'black' : 'white';

		// Animate button
		const btn = buttonRef.value;
		if (isMesh(btn) && btn.scale) {
			// Simple pulse animation
			gsap.to(btn.scale, {
				x: 1.2,
				y: 1.2,
				z: 1.2,
				duration: 0.2,
				ease: 'back.out',
				onComplete: () => {
					gsap.to(btn.scale, {
						x: 1,
						y: 1,
						z: 1,
						duration: 0.2,
					});
				},
			});
		}
	};
</script>
