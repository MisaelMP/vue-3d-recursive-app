<template>
	<div class="time-overlay">{{ currentTime }}</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { useIntervalFn } from '@vueuse/core';

	const currentTime = ref('');
	const updateTime = () => {
		currentTime.value = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	};
	updateTime();
	useIntervalFn(updateTime, 60000);
</script>

<style scoped>
	.time-overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		color: black;
		font-size: 1.25rem;
		font-weight: 600;
		z-index: 999;
	}
</style>
