<script lang="ts" setup>
import type { PropType } from 'vue'

type TLinks = {
	label: string
	url?: string
}[]

const props = defineProps({
	links: {
		type: Array as PropType<TLinks>,
		required: true,
	},
})
</script>
<template>
	<div class="flex items-center justify-start gap-2 mt-2">
		<div
			v-for="(link, index) in props.links"
			:key="link.label"
			class="flex items-center justify-start gap-2"
		>
			<NuxtLink
				:to="link.url"
				class="font-inter text-sm"
				:class="[
					link.url ? 'hover:text-main transition-colors duration-300' : '',
				]"
			>
				{{ link.label }}
			</NuxtLink>
			<span v-if="index + 1 !== props.links?.length" class="font-inter text-sm"
				>/</span
			>
		</div>
	</div>
</template>
