<template>
	<TresCanvas
		clear-color="#F2EDDE"
		window-size
		shadows
		:toneMapping="NoToneMapping"
		:outputColorSpace="SRGBColorSpace"
		:shadowMapType="BasicShadowMap"
	>
		<TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 5]" />
		<TresAmbientLight :intensity="0.4" />
		<TresDirectionalLight
			cast-shadow
			:intensity="1.2"
			:position="[0, 10, 10]"
			shadow-mapSize-width="1024"
			shadow-mapSize-height="1024"
		/>
		<TresPointLight :position="[0, 2, 5]" :intensity="0.8" />
		<TresDirectionalLight :position="[0, 0, -5]" :intensity="0.3" />
		<OrbitControls />
		<RecursivePhone :depth="0" :maxDepth="5" />
	</TresCanvas>
</template>

<script setup lang="ts">
	import { provide, ref, onMounted } from 'vue';
	import { OrbitControls } from '@tresjs/cientos';
	import RecursivePhone from './components/RecursivePhone.vue';
	import { NoToneMapping, SRGBColorSpace, BasicShadowMap } from 'three';

	const cameraRef = ref(null);
	onMounted(() => {
		provide('camera', cameraRef.value);
	});
</script>
