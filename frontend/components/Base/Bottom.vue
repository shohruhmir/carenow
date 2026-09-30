<script setup lang="ts">
// props
const props = defineProps({
	isOpen: {
		type: Boolean,
		required: true,
	},
	withSearch: {
		type: Boolean,
		default: false,
	},
})
// emits
const emit = defineEmits(['close'])
// search
// header height
const header = ref()
const headerHeight = computed(() => {
	let height = 0
	if (header.value) {
		height = header.value.offsetHeight
	}
	return height
})
</script>
<template>
	<div
		class="fixed w-full h-svh z-50 top-0 left-0 transition-all duration-500"
		:class="[props.isOpen ? 'opacity-100 visible' : 'opacity-0 invisible']"
	>
		<!-- overlay -->
		<div
			class="absolute top-0 left-0 bg-gray-200/75 transition-all w-full h-full"
			@click="emit('close')"
		/>
		<!-- overlay -->
		<Transition name="drawer">
			<!-- :class="[props.isOpen ? 'bottom-0' : '-bottom-full']" -->
			<div
				v-if="isOpen"
				class="absolute bottom-0 left-0 h-[95svh] w-full bg-white rounded-t-3xl overflow-visible transition-all duration-700"
			>
				<div
					id="drawer-header"
					ref="header"
					class="bg-white rounded-t-3xl px-3 pt-10 relative after:absolute after:top-5 after:left-1/2 after:-translate-x-1/2 after:bg-gray-2 after:w-14 after:h-1.5 after:rounded-xl"
				>
					<div class="">
						<slot name="header" />
					</div>
					<button
						class="absolute top-3 right-3 w-7.5 h-7.5 flex items-center justify-center rounded-full bg-gray-1"
						@click="emit('close')"
					>
						<Icon
							name="i-heroicons-x-mark-20-solid"
							class="w-full h-full text-gray-3 text-base"
						/>
					</button>
				</div>
				<div
					class="p-0 overflow-y-auto"
					:style="`max-height: calc(95svh -  ${headerHeight}px)`"
				>
					<slot />
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="css" scoped></style>
