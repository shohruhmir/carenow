<script lang="ts" setup>
// props
const props = defineProps({
	clinic: {
		type: Object,
		required: true,
	},
})
</script>
<template>
	<NuxtLink
		:to="`/clinics/${props.clinic.id}`"
		class="block rounded-xl shadow-xl overflow-hidden"
		data-aos="fade-up"
	>
		<div class="w-full h-auto">
			<img
				src="~/assets/images/jpg/clinic.jpg"
				alt="clinic"
				class="object-cover w-full h-full"
			/>
		</div>

		<div class="p-4">
			<div class="flex items-center justify-between">
				<h3>FT Women Salon</h3>
				<div class="flex items-center gap-1">
					<UIcon
						name="material-symbols:star-outline-rounded"
						class="text-lg text-orange-500"
					/>
					<p class="font-inter">4.5</p>
					<span class="font-inter">(20)</span>
				</div>
			</div>
			<div class="mt-2 flex items-center gap-2">
				<UIcon
					name="qlementine-icons:location-16"
					class="text-md w-6 h-6 shrink-0"
				/>
				<p class="font-inter line-clamp-1 text-sm">
					Building No. 421 Zone 53, Ground Floor, 530 Al Wajbah St, Ar-Rayyan
				</p>
			</div>
			<div class="mt-2 flex items-center justify-between gap-10">
				<div class="flex items-center gap-2">
					<UIcon name="mingcute:time-line" class="text-md w-6 h-6 shrink-0" />
					<p class="font-inter line-clamp-1 text-sm">
						Building No. 421 Zone 53, Ground Floor, 530 Al Wajbah St, Ar-Rayyan
					</p>
				</div>
				<p
					class="font-inter text-xs bg-green-500 text-white rounded-xl px-3 py-1"
				>
					Ochiq
				</p>
			</div>
		</div>
	</NuxtLink>
</template>
