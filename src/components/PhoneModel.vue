<!-- File: src/components/PhoneModel.vue -->
<template>
	<TresGroup>
		<primitive :object="model" />
		<VortexEffect
			v-if="showVortex"
			:position="[0, 0, 0]"
			:scale="[2.2, 2.2, 2.2]"
		/>
		<TresGroup :position="screenPosition" :rotation="screenRotation">
			<!-- Time Text - positioned at top center -->
			<primitive
				:object="timePlane"
				:position="[0, 0.8, 0.01]"
				:scale="[0.4, 0.12, 1]"
			/>

			<!-- Portfolio Icon -->
			<TresMesh
				:position="[-0.2, 0.2, 0.01]"
				:ref="(el) => setIconRef('portfolio', el)"
				@click="() => handleIconClick('https://misaelm.com', 'portfolio')"
			>
				<TresPlaneGeometry :args="[0.25, 0.25]" />
				<TresMeshBasicMaterial
					:map="portfolioTexture"
					:tone-mapped="false"
					:depth-test="false"
				/>
			</TresMesh>

			<!-- LinkedIn Icon -->
			<TresMesh
				:position="[0.2, 0.2, 0.01]"
				:ref="(el) => setIconRef('linkedin', el)"
				@click="
					() =>
						handleIconClick(
							'https://www.linkedin.com/in/misael-mercado/',
							'linkedin'
						)
				"
			>
				<TresPlaneGeometry :args="[0.25, 0.25]" />
				<TresMeshBasicMaterial
					:map="linkedinTexture"
					:tone-mapped="false"
					:depth-test="false"
				/>
			</TresMesh>

			<!-- Button -->
			<TresMesh
				ref="buttonRef"
				:position="[0, -0.8, 0.01]"
				@click="handleAppClick"
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
	import { ref, onMounted, watch, inject } from 'vue';
	import * as THREE from 'three';
	import { useIntervalFn } from '@vueuse/core';
	import gsap from 'gsap';
	import { VortexShaderMaterial } from '../shaders/VortexShaderMaterial';
	import VortexEffect from './VortexEffect.vue';
	import { Mesh } from 'three';

	const { scene: model } = await useGLTF('/models/iphone-empty.glb');
	const scene = inject<THREE.Scene | null>('scene', null);

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

	// Screen content positioning - adjusted to be closer to the screen
	const screenPosition: [number, number, number] = [0, 0.1, -0.1];
	const screenRotation: [number, number, number] = [-0.15, 0, 0];

	// Icon setup
	const iconRefs = ref<Record<string, Mesh | null>>({});

	// Load icon textures
	const portfolioTexture = new THREE.TextureLoader().load(
		'/icons/Misael_Logo.svg'
	);
	const linkedinTexture = new THREE.TextureLoader().load(
		'/icons/LinkedIn_icon.svg'
	);

	// Button setup
	const buttonRef = ref<Mesh | null>(null);
	const buttonColour = ref('#2f84ff');
	const buttonColourText = ref('white');
	const buttonText = ref('Open');
	const showVortex = ref(false);
	const vortexColor = ref('#2f84ff');

	// Type guard for Mesh
	const isMesh = (obj: any): obj is Mesh => {
		return obj && 'isMesh' in obj && obj.isMesh;
	};

	// Helper function to set icon ref
	const setIconRef = (index: string, element: any) => {
		if (element && isMesh(element)) {
			iconRefs.value[index] = element;
		}
	};

	// Create button texture
	function createTextTexture(text: string): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 128;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get 2D context');

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = buttonColour.value;
		ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
		ctx.fill();

		ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
		ctx.stroke();

		ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = buttonColourText.value;
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);

		return new THREE.CanvasTexture(canvas);
	}

	const buttonTexture = ref<THREE.CanvasTexture>(createTextTexture('Open'));

	// Update button texture when text changes
	watch(buttonText, (newText) => {
		buttonTexture.value = createTextTexture(newText);
		if (buttonRef.value?.material instanceof THREE.MeshBasicMaterial) {
			buttonRef.value.material.map = buttonTexture.value;
			buttonRef.value.material.needsUpdate = true;
		}
	});

	// Update button texture when color changes
	watch(buttonColour, () => {
		buttonTexture.value = createTextTexture(buttonText.value);
		if (buttonRef.value?.material instanceof THREE.MeshBasicMaterial) {
			buttonRef.value.material.map = buttonTexture.value;
			buttonRef.value.material.needsUpdate = true;
		}
	});

	// Time display setup
	function createTimeTexture(text: string): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 64;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get 2D context');

		ctx.clearRect(0, 0, canvas.width, canvas.height);
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
		if (timePlane.material instanceof THREE.MeshBasicMaterial) {
			timePlane.material.map = timeTexture.value;
			timePlane.material.needsUpdate = true;
		}
	};

	const handleIconClick = (url: string, index: string) => {
		const iconMesh = iconRefs.value[index];
		if (isMesh(iconMesh) && iconMesh.scale) {
			gsap.to(iconMesh.scale, {
				x: 1.2,
				y: 1.2,
				z: 1.2,
				duration: 0.2,
				ease: 'back.out',
				onComplete: () => {
					if (isMesh(iconMesh)) {
						gsap.to(iconMesh.scale, {
							x: 1,
							y: 1,
							z: 1,
							duration: 0.2,
						});
					}
				},
			});
		}

		window.open(url, '_blank');
	};

	const handleAppClick = () => {
		showVortex.value = !showVortex.value;
		buttonText.value = showVortex.value ? 'Close' : 'Open';
		buttonColour.value = showVortex.value ? '#ff5252' : '#2f84ff';
		buttonColourText.value = showVortex.value ? 'black' : 'white';
		vortexColor.value = showVortex.value ? '#ff5252' : '#2f84ff';

		const btn = buttonRef.value;
		if (isMesh(btn) && btn.scale) {
			gsap.to(btn.scale, {
				x: 1.2,
				y: 1.2,
				z: 1.2,
				duration: 0.2,
				ease: 'back.out',
				onComplete: () => {
					if (isMesh(btn)) {
						gsap.to(btn.scale, {
							x: 1,
							y: 1,
							z: 1,
							duration: 0.2,
						});
					}
				},
			});
		}

		// Find and animate the VortexSphere
		if (scene) {
			scene.traverse((child) => {
				if (child instanceof THREE.Group && child.name === 'VortexSphere') {
					const vortex = child;
					if (showVortex.value) {
						// Find the shader material
						vortex.traverse((mesh) => {
							if (
								mesh instanceof THREE.Mesh &&
								mesh.material instanceof VortexShaderMaterial
							) {
								const material = mesh.material;
								// Reset and animate the vortex
								material.uniforms.uTime.value = 0;
								material.setSpeed(0.4);
								material.setStrength(1.0);
								material.setBrightness(1.1);
								material.setOpacity(0.7);
							}
						});
					} else {
						// Fade out the vortex
						vortex.traverse((mesh) => {
							if (
								mesh instanceof THREE.Mesh &&
								mesh.material instanceof VortexShaderMaterial
							) {
								const material = mesh.material;
								material.setSpeed(0.2);
								material.setStrength(0.5);
								material.setBrightness(0.5);
								material.setOpacity(0.3);
							}
						});
					}
				}
			});
		}
	};

	// Initialize time display after component is mounted
	onMounted(() => {
		updateTimeTexture();
		useIntervalFn(updateTimeTexture, 60000);
	});
</script>
