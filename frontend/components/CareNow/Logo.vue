<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 36 })
</script>

<template>
	<div class="flex items-center gap-2.5">
		<div
			class="flex items-center justify-center rounded-xl shrink-0"
			:style="{ width: `${size}px`, height: `${size}px`, background: 'linear-gradient(135deg,#0EA5E9,#10B981)' }"
		>
			<svg :width="size * 0.55" :height="size * 0.55" viewBox="0 0 48 48" fill="none">
				<path d="M24 41s-13-8-17.3-15.5C4 21 5 14.5 10 12.5c3.6-1.4 7 .5 9 3.2.6 1 1.4 1 2 0 2-2.7 5.4-4.6 9-3.2 5 2 6 8.5 3.3 13C37 33 24 41 24 41z" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" />
				<path d="M13 25h6l3-6 4 12 3-6h6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>
		<span class="font-extrabold tracking-tight text-ink" :style="{ fontSize: `${size * 0.52}px` }">Care<span class="text-main">Now</span></span>
	</div>
</template>
