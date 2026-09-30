<template>
	<NuxtLink
		v-if="props.href"
		:to="props.href"
		class="flex items-center justify-center rounded-2xl px-8 py-2.5 text-center transition-colors duration-500 group gap-2 cursor-pointer"
		:class="[
			props.buttonClass,
			isFull ? ' w-full' : 'w-auto',
			{ 'bg-main hover:bg-main-hover text-white': props.type === 'primary' },
			{ 'bg-white hover:bg-gray-200 text-main': props.type === 'secondary' },
		]"
	>
		<slot />
		<Icon
			v-if="isLoading"
			name="line-md:loading-twotone-loop"
			class="w-6 h-6"
		/>
		<span class="text-md leading-6">
			{{ props.isLoading ? loadingText : props.text }}
		</span>
	</NuxtLink>
	<button
		v-else
		class="flex items-center justify-center rounded-2xl px-8 py-2.5 text-center transition-colors duration-500 group gap-2 cursor-pointer"
		:class="[
			props.buttonClass,
			isFull ? ' w-full' : 'w-auto',
			{ 'bg-main hover:bg-main-hover text-white': props.type === 'primary' },
			{ 'bg-white hover:bg-gray-200 text-main': props.type === 'secondary' },
		]"
	>
		<slot />
		<Icon
			v-if="isLoading"
			name="line-md:loading-twotone-loop"
			class="w-6 h-6"
		/>
		<span class="text-md leading-6">
			{{ props.isLoading ? loadingText : props.text }}
		</span>
	</button>
</template>

<script setup lang="ts">
//=============================-< imports >-=================================
// language
//=============================- props -=================================
//variables
const props = defineProps({
	isLoading: {
		type: Boolean,
		default: false,
	},
	text: {
		required: true,
		type: String,
	},
	href: {
		type: String,
		default: null,
	},
	isFull: {
		type: Boolean,
		defualt: false,
	},
	buttonClass: {
		type: String,
		default: '',
	},
	type: {
		type: String as PropType<'primary' | 'secondary'>,
		default: 'primary',
	},
})

const loadingText = ref('Yuklanmoqda')
onMounted(() => {})
</script>

<!-- <style lang="scss" scoped></style> -->
