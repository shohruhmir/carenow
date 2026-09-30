<script lang="ts" setup>
// props
const props = defineProps({
	placeholder: {
		type: String,
		default: 'Qidiruv...'
	}
})
// emits
const emit = defineEmits(['change-value'])
</script>
<template>
	<div class="search">
		<UInput
			icon="i-lucide-search"
			size="lg"
			variant="outline"
			:placeholder="props.placeholder"
			type="search"
			class="font-inter text-black border border-gray-300 rounded-lg"
			@input="emit('change-value', $event)"
		/>
	</div>
</template>
