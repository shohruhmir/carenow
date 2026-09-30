<script lang="ts" setup>
// Explicit name: the auto-inferred name from this file ("map") collides with
// the reserved <map> HTML element and trips Vue's dev-mode warning.
defineOptions({ name: 'ClinicsMapPage' })

import type { ClinicSummary, Branch } from '~/composables/useCareNowData'
import { haversineKm } from '~/composables/useCareNowData'

const { load, hasApiKey } = useYandexMaps()
const { fetchClinics } = useClinicsApi()

interface MapBranch {
	clinicId: string
	clinicSlug: string
	clinicName: string
	clinicLogo: string
	clinicLogoBg: string
	clinicLogoFg: string
	clinicRating: string
	branch: Branch
}

const mapEl = ref<HTMLElement | null>(null)
let map: any = null
let placemarks: any[] = []
let userPlacemark: any = null

const mapStatus = ref<'loading' | 'ready' | 'no-key' | 'error'>('loading')
const clinics = ref<ClinicSummary[]>([])
const isLoadingClinics = ref(true)
const searchQuery = ref('')
const filterPills = ['Hammasi', '24/7 ochiq', "Bolalar bo'limi bor", 'Tarmoq (filiallari koʻp)', 'Yuqori reyting']
const activeFilter = ref(0)
const userPos = ref<{ lat: number; lng: number } | null>(null)
const geoStatus = ref<'idle' | 'locating' | 'denied' | 'error'>('idle')
const activeBranchKey = ref<string | null>(null)

const TASHKENT_CENTER: [number, number] = [41.3111, 69.2797]

function branchKey(mb: MapBranch) {
	return `${mb.clinicId}-${mb.branch.id}`
}

function allMapBranches(): MapBranch[] {
	return clinics.value.flatMap((c) => c.branches.map((b) => ({
		clinicId: String(c.id),
		clinicSlug: c.slug,
		clinicName: c.name,
		clinicLogo: c.logo,
		clinicLogoBg: c.logoBg,
		clinicLogoFg: c.logoFg,
		clinicRating: c.rating,
		branch: b,
	})))
}

function matchesFilter(mb: MapBranch) {
	const clinic = clinics.value.find((c) => String(c.id) === mb.clinicId)
	if (!clinic) return true
	switch (activeFilter.value) {
		case 1: return clinic.is247
		case 2: return clinic.badges.some((b) => b.label.toLowerCase().includes("bolalar"))
		case 3: return clinic.branches.length > 1
		case 4: return Number(clinic.rating) >= 4.8
		default: return true
	}
}

function matchesSearch(mb: MapBranch) {
	if (!searchQuery.value.trim()) return true
	const q = searchQuery.value.trim().toLowerCase()
	return mb.clinicName.toLowerCase().includes(q) || mb.branch.name.toLowerCase().includes(q) || mb.branch.addr.toLowerCase().includes(q)
}

const visibleBranches = computed(() => {
	const list = allMapBranches().filter((mb) => matchesFilter(mb) && matchesSearch(mb))
	if (userPos.value) {
		return [...list].sort((a, b) =>
			haversineKm(userPos.value!.lat, userPos.value!.lng, a.branch.lat, a.branch.lng)
			- haversineKm(userPos.value!.lat, userPos.value!.lng, b.branch.lat, b.branch.lng),
		)
	}
	return list
})

function distanceLabel(mb: MapBranch) {
	if (!userPos.value) return null
	const km = haversineKm(userPos.value.lat, userPos.value.lng, mb.branch.lat, mb.branch.lng)
	return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

function renderPlacemarks() {
	if (!map) return
	placemarks.forEach((p) => map.geoObjects.remove(p))
	placemarks = []

	for (const mb of visibleBranches.value) {
		const placemark = new window.ymaps.Placemark(
			[mb.branch.lat, mb.branch.lng],
			{
				hintContent: mb.branch.name,
				balloonContentHeader: mb.branch.name,
				balloonContentBody: `${mb.branch.addr}<br/>${mb.branch.hours}`,
			},
			{ preset: 'islands#blueDotIconWithCaption', iconCaption: mb.clinicLogo },
		)
		placemark.events.add('click', () => {
			activeBranchKey.value = branchKey(mb)
		})
		map.geoObjects.add(placemark)
		placemarks.push(placemark)
	}
}

function focusBranch(mb: MapBranch) {
	activeBranchKey.value = branchKey(mb)
	if (map) map.setCenter([mb.branch.lat, mb.branch.lng], Math.max(map.getZoom(), 14), { duration: 300 })
}

function locateMe() {
	if (!navigator.geolocation) {
		geoStatus.value = 'error'
		return
	}
	geoStatus.value = 'locating'
	navigator.geolocation.getCurrentPosition(
		(pos) => {
			userPos.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
			geoStatus.value = 'idle'
			if (map) {
				if (userPlacemark) map.geoObjects.remove(userPlacemark)
				userPlacemark = new window.ymaps.Placemark(
					[userPos.value.lat, userPos.value.lng],
					{ hintContent: 'Siz shu yerdasiz' },
					{ preset: 'islands#geolocationIcon' },
				)
				map.geoObjects.add(userPlacemark)
				map.setCenter([userPos.value.lat, userPos.value.lng], 13, { duration: 300 })
			}
		},
		() => { geoStatus.value = 'denied' },
		{ enableHighAccuracy: true, timeout: 8000 },
	)
}

watch(visibleBranches, () => renderPlacemarks())

onMounted(async () => {
	isLoadingClinics.value = true
	clinics.value = await fetchClinics()
	isLoadingClinics.value = false

	if (!hasApiKey) {
		mapStatus.value = 'no-key'
		return
	}
	try {
		await load()
		map = new window.ymaps.Map(mapEl.value, {
			center: TASHKENT_CENTER,
			zoom: 12,
			controls: ['zoomControl', 'geolocationControl'],
		})
		mapStatus.value = 'ready'
		renderPlacemarks()
	} catch {
		mapStatus.value = 'error'
	}
})

onBeforeUnmount(() => {
	if (map) map.destroy()
})
</script>

<template>
	<main class="flex flex-col h-screen">
		<CareNowHeader />

		<div class="relative flex-1 min-h-0">
			<!-- map surface -->
			<div v-if="mapStatus !== 'no-key' && mapStatus !== 'error'" ref="mapEl" class="absolute inset-0 bg-surface" />
			<div v-else class="absolute inset-0 bg-surface flex items-center justify-center px-6">
				<div class="max-w-sm text-center">
					<div class="w-14 h-14 rounded-2xl bg-brand-sky-light flex items-center justify-center mx-auto">
						<UIcon name="tabler:map-pin-off" class="text-brand-sky text-2xl" />
					</div>
					<div class="text-base font-bold mt-4">Xarita hozircha mavjud emas</div>
					<p class="text-sm text-ink-mute mt-2 leading-relaxed">
						{{ mapStatus === 'no-key' ? "Yandex Maps API kaliti sozlanmagan (NUXT_PUBLIC_YANDEX_MAPS_API_KEY)." : "Xaritani yuklab bo'lmadi. Internet aloqasini tekshiring." }}
						Quyida klinikalar ro'yxatini ko'rishda davom etishingiz mumkin.
					</p>
				</div>
			</div>

			<!-- top floating bar -->
			<div class="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3 pointer-events-none">
				<div class="flex items-center gap-3 pointer-events-auto">
					<NuxtLink to="/clinics" class="shrink-0 w-11 h-11 rounded-2xl bg-card border border-line-soft shadow-md flex items-center justify-center hover:bg-surface transition-colors">
						<UIcon name="tabler:arrow-left" class="text-lg" />
					</NuxtLink>
					<div class="flex-1 flex items-center gap-2 bg-card border border-line-soft rounded-2xl px-4 h-11 shadow-md">
						<UIcon name="tabler:search" class="text-ink-mute text-lg shrink-0" />
						<input v-model="searchQuery" type="text" placeholder="Klinika yoki manzil qidirish…" class="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink-mute" />
					</div>
				</div>
				<div class="flex gap-2 flex-wrap pointer-events-auto">
					<button
						v-for="(f, i) in filterPills" :key="f" type="button"
						class="text-xs font-bold h-9 inline-flex items-center px-4 rounded-full cursor-pointer transition-colors shadow-md"
						:class="i === activeFilter ? 'text-white bg-main' : 'text-ink-soft bg-card hover:bg-surface'"
						@click="activeFilter = i"
					>{{ f }}</button>
				</div>
			</div>

			<!-- near-me FAB -->
			<button
				type="button"
				class="absolute right-4 bottom-[168px] md:bottom-4 z-10 flex items-center gap-2 bg-card border border-line-soft shadow-lg rounded-2xl px-4 h-11 text-sm font-bold cursor-pointer hover:bg-surface transition-colors"
				:disabled="geoStatus === 'locating'"
				@click="locateMe"
			>
				<UIcon name="tabler:current-location" class="text-main text-lg" :class="geoStatus === 'locating' ? 'animate-spin' : ''" />
				{{ geoStatus === 'locating' ? 'Aniqlanmoqda…' : 'Menga yaqin' }}
			</button>
			<div v-if="geoStatus === 'denied'" class="absolute right-4 bottom-[224px] md:bottom-[68px] z-10 max-w-[240px] text-xs font-semibold text-white bg-slate-900 rounded-xl px-3 py-2 shadow-lg">
				Joylashuvga ruxsat berilmadi. Brauzer sozlamalaridan yoqing.
			</div>

			<!-- bottom card strip -->
			<div class="absolute left-0 right-0 bottom-0 bg-card border-t border-line-soft">
				<div class="px-4 pt-3 text-xs font-bold text-ink-mute">
					{{ isLoadingClinics ? 'Yuklanmoqda…' : `${visibleBranches.length} ta filial` }}
				</div>
				<div class="flex gap-3 overflow-x-auto px-4 py-4 snap-x snap-mandatory">
					<button
						v-for="mb in visibleBranches" :key="branchKey(mb)" type="button"
						class="snap-start shrink-0 w-[260px] text-left bg-card border rounded-2xl px-4 py-3 cursor-pointer transition-colors"
						:class="activeBranchKey === branchKey(mb) ? 'border-main shadow-md' : 'border-line-soft hover:border-line'"
						@click="focusBranch(mb)"
					>
						<div class="flex items-center gap-2.5">
							<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0" :style="{ background: mb.clinicLogoBg, color: mb.clinicLogoFg }">{{ mb.clinicLogo }}</div>
							<div class="min-w-0">
								<div class="text-sm font-bold truncate">{{ mb.clinicName }}</div>
								<div class="flex items-center gap-1 text-xs text-ink-mute"><UIcon name="tabler:star-filled" class="text-brand-amber text-[11px]" />{{ mb.clinicRating }}</div>
							</div>
							<div v-if="distanceLabel(mb)" class="ml-auto shrink-0 text-xs font-extrabold text-main bg-brand-sky-light rounded-full px-2.5 py-1">{{ distanceLabel(mb) }}</div>
						</div>
						<div class="text-xs text-ink-soft mt-2 truncate">{{ mb.branch.addr }}</div>
						<NuxtLink :to="`/clinics/${mb.clinicSlug}`" class="text-xs font-bold text-main mt-2 inline-block" @click.stop>Klinikani ko'rish →</NuxtLink>
					</button>
					<div v-if="!isLoadingClinics && !visibleBranches.length" class="shrink-0 w-full text-center text-sm text-ink-mute py-6">Hech narsa topilmadi</div>
				</div>
			</div>
		</div>
	</main>
</template>
