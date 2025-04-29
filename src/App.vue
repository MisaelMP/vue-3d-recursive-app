<template>
	<div ref="containerRef" class="canvas-container">
		<TresCanvas
			clear-color="#111122"
			window-size
			shadows
			:toneMapping="ACESFilmicToneMapping"
			:toneMappingExposure="2.0"
			:outputColorSpace="SRGBColorSpace"
			:shadowMapType="PCFSoftShadowMap"
			:shadow-map-enabled="true"
			:useLegacyLights="false"
			:transmission-sampler="true"
			@ready="handleCanvasReady"
		>
			<TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 5]" :fov="50" />
			<TresAmbientLight :intensity="0.8" />
			<TresDirectionalLight
				cast-shadow
				:intensity="1.5"
				:position="[5, 10, 5]"
				shadow-mapSize-width="2048"
				shadow-mapSize-height="2048"
				:shadow-camera-far="50"
				:shadow-camera-near="0.5"
				:shadow-camera-left="-10"
				:shadow-camera-right="10"
				:shadow-camera-top="10"
				:shadow-camera-bottom="-10"
				:shadow-bias="-0.0001"
			/>
			<TresPointLight
				:position="[-5, 2, -5]"
				:intensity="1.5"
				color="#4488ff"
			/>
			<TresPointLight :position="[5, -2, 5]" :intensity="1.5" color="#ff8844" />
			<OrbitControls :enableDamping="true" :dampingFactor="0.05" />

			<!-- Floor for better shadows -->
			<TresMesh rotation-x="-1.5708" position-y="-2" receive-shadow>
				<TresPlaneGeometry :args="[20, 20]" />
				<TresMeshStandardMaterial
					color="#151530"
					:roughness="0.8"
					:metalness="0.2"
				/>
			</TresMesh>

			<Suspense>
				<template #default>
					<TresGroup>
						<PhoneModel />
						<!-- Glass sphere with vortex inside it -->
						<TresGroup :position="[0, 0.2, -0.2]">
							<VortexSphere />
						</TresGroup>
					</TresGroup>
				</template>
				<template #fallback>
					<TresGroup>
						<Text3D
							text="Loading..."
							:position="[-1.5, 0, 0]"
							:size="0.5"
							:height="0.1"
							font="/fonts/helvetiker_regular.typeface.json"
						>
							<TresMeshStandardMaterial
								color="white"
								:metalness="0.4"
								:roughness="0.4"
							/>
						</Text3D>
					</TresGroup>
				</template>
			</Suspense>
		</TresCanvas>
	</div>
</template>

<script setup lang="ts">
	import { provide, ref, onMounted, watch } from 'vue';
	import { OrbitControls, Text3D } from '@tresjs/cientos';
	import VortexSphere from './components/VortexSphere.vue';
	import PhoneModel from './components/PhoneModel.vue';
	import {
		ACESFilmicToneMapping,
		SRGBColorSpace,
		PCFSoftShadowMap,
		PMREMGenerator,
		EquirectangularReflectionMapping,
		WebGLRenderer,
		Scene,
	} from 'three';
	import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
	import { useElementSize, useWindowSize } from '@vueuse/core';

	const cameraRef = ref(null);
	const containerRef = ref(null);

	// Use VueUse to track window size
	const { width: windowWidth, height: windowHeight } = useWindowSize();

	// Track container size with useElementSize
	useElementSize(containerRef);

	// Set up camera and environment
	onMounted(() => {
		provide('camera', cameraRef.value);
	});

	// Watch for window size changes
	watch([windowWidth, windowHeight], () => {
		console.log(`Window resized: ${windowWidth.value}x${windowHeight.value}`);
	});

	const handleCanvasReady = (event: {
		scene: Scene;
		renderer: { renderState: { webGLRenderer: WebGLRenderer } };
	}) => {
		// Store references to renderer, scene, etc.
		const { scene: sceneObj, renderer } = event;

		// Provide the scene to child components
		provide('scene', sceneObj);

		// Load HDR environment map for reflections
		const rgbeLoader = new RGBELoader();
		rgbeLoader.load(
			'/textures/hdri/rogland_clear_night_1k.hdr',
			(hdrTexture) => {
				hdrTexture.mapping = EquirectangularReflectionMapping;

				// Make sure renderer is properly initialized
				if (renderer && renderer.renderState) {
					try {
						// Create PMREM generator with the renderer's WebGLRenderer instance
						const pmremGenerator = new PMREMGenerator(
							renderer.renderState.webGLRenderer
						);
						pmremGenerator.compileEquirectangularShader();

						const envMap =
							pmremGenerator.fromEquirectangular(hdrTexture).texture;
						sceneObj.environment = envMap;

						// Dispose of original HDR texture and generator after processing
						hdrTexture.dispose();
						pmremGenerator.dispose();

						console.log('HDRI environment map applied to scene with PMREM');
					} catch (error) {
						// If PMREM fails, use the direct approach
						console.warn('PMREM failed, falling back to direct texture', error);
						sceneObj.environment = hdrTexture;
					}
				} else {
					// If no renderer, just use the texture directly
					console.warn('Renderer not available, using direct texture');
					sceneObj.environment = hdrTexture;
				}
			}
		);
	};
</script>

<style>
	.canvas-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: #000;
	}
</style>
