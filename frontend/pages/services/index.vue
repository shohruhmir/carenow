<script lang="ts" setup>
import type { SpecCategory } from '~/composables/useCareNowData'

interface ServiceCatalogEntry { name: string; minPrice: number; maxPrice: number; clinicCount: number }

const SERVICE_EMOJI: Record<string, string> = {
	'Konsultatsiya': '🩺',
	"Breket o'rnatish": '😁',
	"Implant o'rnatish": '🔩',
	'Bolalar profilaktikasi': '🧸',
}
const DEFAULT_SERVICE_EMOJI = '🦷'

function priceLabel(entry: ServiceCatalogEntry) {
	const min = entry.minPrice.toLocaleString('ru-RU')
	if (entry.minPrice === entry.maxPrice) return `${min} so'm`
	return `${min} – ${entry.maxPrice.toLocaleString('ru-RU')} so'm`
}

const { fetchSpecialties } = useSpecialtiesApi()
const { fetchServiceCatalog } = useClinicsApi()

const specs = ref<SpecCategory[]>([])
const catalog = ref<ServiceCatalogEntry[]>([])
const isLoading = ref(true)

onMounted(async () => {
	isLoading.value = true
	;[specs.value, catalog.value] = await Promise.all([fetchSpecialties(), fetchServiceCatalog()])
	isLoading.value = false
})
</script>

<template>
	<main>
		<CareNowHeader />

		<div class="container py-10">
			<div class="text-xs text-ink-mute mb-2">Bosh sahifa / Bemorlarga / Xizmatlar</div>
			<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">Stomatologiya xizmatlari va narxlar, Toshkent</h1>
			<p class="mt-3 text-base text-ink-mute leading-relaxed max-w-xl">Narxlar klinikalar e'lon qilgan diapazon asosida. Aniq narx konsultatsiyadan keyin belgilanadi — CareNow orqali yozilsangiz chegirma avtomatik qo'llanadi.</p>

			<div v-if="isLoading" class="text-sm text-ink-mute py-8">Yuklanmoqda…</div>
			<template v-else>
				<div v-if="!specs.length" class="text-sm text-ink-mute py-4">Hali shifokor qo'shilmagan</div>
				<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
					<NuxtLink
						v-for="s in specs" :key="s.name" :to="{ path: '/doctors', query: { q: s.name } }"
						class="flex items-center gap-4 bg-surface border border-line-soft rounded-2xl px-5 py-4 hover:border-line transition-colors"
					>
						<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" :style="{ background: s.bg }">{{ s.emoji }}</div>
						<div><div class="text-base font-bold">{{ s.name }}</div><div class="text-xs text-ink-mute mt-0.5">{{ s.count }} shifokor</div></div>
					</NuxtLink>
				</div>

				<h2 class="mt-11 text-xl font-extrabold tracking-tight">Xizmatlar narxi</h2>
				<div v-if="!catalog.length" class="text-sm text-ink-mute py-8 mt-5 text-center border border-line-soft rounded-3xl">Hali xizmat qo'shilmagan</div>
				<div v-else class="mt-5 border border-line rounded-3xl overflow-hidden">
					<div class="grid grid-cols-[1.4fr_minmax(0,1fr)_.7fr_.6fr] gap-4 px-6 py-4 bg-surface text-xs font-bold tracking-wide uppercase text-ink-mute">
						<span>Xizmat</span><span>Narx diapazoni</span><span>Klinikalar</span><span />
					</div>
					<div v-for="s in catalog" :key="s.name" class="grid grid-cols-[1.4fr_minmax(0,1fr)_.7fr_.6fr] gap-4 px-6 py-4 border-t border-line-soft items-center">
						<div class="flex items-center gap-3"><span class="text-lg">{{ SERVICE_EMOJI[s.name] ?? DEFAULT_SERVICE_EMOJI }}</span><span class="text-sm font-bold">{{ s.name }}</span></div>
						<span class="text-sm font-bold">{{ priceLabel(s) }}</span>
						<span class="text-sm font-bold text-main">{{ s.clinicCount }} klinika</span>
						<NuxtLink to="/clinics" class="text-center border-0 cursor-pointer text-xs font-bold text-white bg-main py-3 rounded-xl">{{ $t('cn.buttons.book') }}</NuxtLink>
					</div>
				</div>
			</template>
		</div>

		<CareNowFooter />
	</main>
</template>
