<script setup lang="ts">
import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

const { options } = defineProps({
	options: {
		type: Object,
		required: true,
	},
})

const container = ref(null)

onMounted(() => {
	Fancybox.bind(container.value, '[data-fancybox]', {
		...(options || {}),
	})
})

onUpdated(() => {
	Fancybox.unbind(container.value)
	Fancybox.close()

	Fancybox.bind(container.value, '[data-fancybox]', {
		...(options || {}),
	})
})

onUnmounted(() => {
	Fancybox.destroy()
})
</script>

<template>
	<div ref="container">
		<slot />
	</div>
</template>

<style></style>
