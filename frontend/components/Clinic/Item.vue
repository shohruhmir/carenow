<script lang="ts" setup>
// props
const props = defineProps({
	clinic: {
		type: Object,
		required: true,
	},
	cardClasses: {
		type: String,
		default: '',
	},
})

//===============================-< active filial >-===============================
//> variables
const activeFilialid = ref(1)
//> functions
</script>
<template>
	<article
		class="rounded-xl overflow-hidden flex shadow-card"
		:class="cardClasses"
		data-aos="fade-up"
	>
		<NuxtLink
			:to="`/clinics/${props.clinic.id}`"
			class="block w-full h-auto max-w-72"
		>
			<img
				src="~/assets/images/jpg/clinic.jpg"
				alt="clinic"
				class="object-cover w-full h-full"
			/>
		</NuxtLink>

		<div class="p-4 flex flex-col">
			<div class="flex items-center justify-between">
				<NuxtLink :to="`/clinics/${props.clinic.id}`" class="font-semibold"
					>FT Women Salon</NuxtLink
				>
				<div class="flex items-center gap-1">
					<UIcon
						name="material-symbols:star-outline-rounded"
						class="text-lg text-orange-500"
					/>
					<p class="font-inter">4.5</p>
					<span class="font-inter">(20)</span>
				</div>
			</div>
			<div class="mt-3 font-inter text-sm">
				Via Medical — многопрофильный медицинский центр в Алматы, открытый в
				2021 году. Основное направление работы — помощь взрослым и детям в
				диагностике и ...
			</div>
		</div>

		<div class="py-4 border-l border-l-gray-300 w-72 shrink-0">
			<div class="border-b border-gray-300 px-4 pb-2">
				<h4 class="font-inter text-md">Filiallar:</h4>
				<div class="flex gap-2 mt-3">
					<button
						v-for="item in 4"
						:key="item"
						class="w-12 font-inter text-sm border border-main hover:bg-main-hover hover:text-white cursor-pointer rounded-xl px-4 py-1.5 transition-colors"
						:class="[
							activeFilialid === item
								? 'bg-main text-white'
								: 'bg-bg text-main',
						]"
						@click="activeFilialid = item"
					>
						{{ item }}
					</button>
				</div>
			</div>
			<div class="px-4 mt-3">
				<article class="mt-2">
					<div class="flex items-start gap-2">
						<UIcon
							name="qlementine-icons:location-16"
							class="text-md w-6 h-6 shrink-0"
						/>
						<p class="font-inter text-sm">
							Building No. 421 Zone 53, Ground Floor, 530 Al Wajbah St,
							Ar-Rayyan Lorem ipsum,
						</p>
					</div>
					<div class="mt-2 flex items-center gap-2">
						<UIcon name="mingcute:time-line" class="text-md w-6 h-6 shrink-0" />
						<p class="font-inter line-clamp-1 text-sm">Open until '9 PM'</p>
					</div>
					<div
						class="mt-2 font-inter text-xs bg-green-500 text-white text-center rounded-xl px-3 py-2"
					>
						Ochiq
					</div>
				</article>
			</div>
		</div>
	</article>
</template>
