<script lang="ts" setup>
import type { ClinicSummary } from '~/composables/useClinicsApi'

const { fetchClinics } = useClinicsApi()

const filterPills = ['Hammasi', '24/7 ochiq', "Bolalar bo'limi bor", 'Tarmoq (filiallari koʻp)', 'Yuqori reyting']
const activeFilter = ref(0)

const clinics = ref<ClinicSummary[]>([])
const isLoading = ref(true)

async function loadClinics() {
	isLoading.value = true
	clinics.value = await fetchClinics(activeFilter.value === 1 ? { is247: true } : {})
	isLoading.value = false
}

onMounted(loadClinics)
watch(activeFilter, loadClinics)
</script>

<template>
	<main>
		<CareNowHeader />

		<div class="container pt-9 pb-3">
			<div class="text-xs text-ink-mute mb-2">Bosh sahifa / Klinikalar</div>
			<div class="flex justify-between items-baseline flex-wrap gap-3">
				<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">Stomatologiya klinikalari, Toshkent <span class="text-ink-mute font-semibold">({{ clinics.length }})</span></h1>
				<NuxtLink to="/clinics/map" class="text-sm font-bold text-main">Xaritada ko'rish →</NuxtLink>
			</div>
			<div class="flex gap-2 mt-5 flex-wrap">
				<button
					v-for="(f, i) in filterPills" :key="f" type="button"
					class="text-xs font-bold min-h-11 inline-flex items-center px-4.5 rounded-full cursor-pointer transition-colors"
					:class="i === activeFilter ? 'text-white bg-main' : 'text-ink-soft bg-surface hover:bg-line-soft'"
					@click="activeFilter = i"
				>{{ f }}</button>
			</div>
		</div>

		<div class="container py-6 flex flex-col gap-5 bg-card">
			<div v-if="isLoading" class="text-sm text-ink-mute py-10 text-center">Yuklanmoqda…</div>
			<div v-else-if="!clinics.length" class="text-sm text-ink-mute py-10 text-center">Klinika topilmadi</div>
			<CareNowClinicCard v-for="c in clinics" :key="c.id" :clinic="c" />
		</div>

		<CareNowFooter />
	</main>
</template>
