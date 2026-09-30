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
</script>
<template>
	<div
		class="fixed w-full h-svh z-50 top-0 left-0 transition-all duration-500"
		:class="[props.isOpen ? 'opacity-100 visible' : 'opacity-0 invisible']"
	>
		<!-- overlay -->
		<div
			class="absolute top-0 left-0 bg-gray-950/60 transition-all w-full h-full"
			@click="emit('close')"
		/>
		<!-- overlay -->
		<Transition name="modal">
			<div
				v-if="props.isOpen"
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-screen max-h-max w-full max-w-2xl bg-bg overflow-visible transition-all duration-700 rounded-2xl"
			>
				<div class="p-6 pb-0 rounded-t-2xl">
					<slot name="header" />
					<button
						class="absolute top-3 right-3 w-7.5 h-7.5 flex items-center justify-center rounded-full bg-gray-200 cursor-pointer"
						@click="emit('close')"
					>
						<Icon
							name="i-heroicons-x-mark-20-solid"
							class="w-full h-full text-text text-md"
						/>
					</button>
				</div>
				<div class="p-6 overflow-y-visible">
					<slot />
				</div>
			</div>
		</Transition>
	</div>
</template>
