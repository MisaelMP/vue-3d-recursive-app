<template>
	<Suspense>
		<PhoneModel @trigger-recursion="recurse" />
	</Suspense>
	<RecursivePhone
		v-if="showNext && depth < maxDepth"
		:depth="depth + 1"
		:maxDepth="maxDepth"
	/>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import PhoneModel from './PhoneModel.vue';
	import RecursivePhone from './RecursivePhone.vue';

	defineProps({
		depth: { type: Number, default: 0 },
		maxDepth: { type: Number, default: 5 },
	});

	const showNext = ref(false);
	const recurse = () => requestAnimationFrame(() => (showNext.value = true));
</script>
