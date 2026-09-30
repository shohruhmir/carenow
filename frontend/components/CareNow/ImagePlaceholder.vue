<script setup lang="ts">
withDefaults(defineProps<{ label?: string; rounded?: boolean }>(), { label: 'Rasm', rounded: false })
</script>

<template>
	<div
		class="w-full h-full min-h-[80px] flex items-center justify-center text-center text-ink-mute text-xs font-semibold px-3"
		:class="rounded ? 'rounded-full' : ''"
		style="background: linear-gradient(135deg, #E0F2FE, #D1FAE5)"
	>
		{{ label }}
	</div>
</template>
