<script lang="ts" setup>
import type { ApiDoctor } from '~/composables/useDoctorsApi'
import type { ApiService } from '~/composables/useClinicsApi'

const route = useRoute()
const router = useRouter()
const token = useToken()
const { fetchDoctorRaw } = useDoctorsApi()
const { fetchClinicRaw } = useClinicsApi()
const { fetchMyFavorites, addFavorite, removeFavorite } = useFavoritesApi()

const doctor = ref<ApiDoctor | null>(null)
const services = ref<ApiService[]>([])
const isLoading = ref(true)
const notFound = ref(false)
const isFavorite = ref(false)
const isTogglingFavorite = ref(false)

const tabs = ['Haqida', 'Xizmatlar', 'Sharhlar']
const activeTab = ref(0)

const initials = computed(() => doctor.value ? doctor.value.name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase() : '')
const priceFrom = computed(() => services.value.length ? Math.min(...services.value.map((s) => s.price)) : null)
const aboutText = computed(() => {
	if (!doctor.value) return ''
	return `${doctor.value.name} — ${doctor.value.specialty} bo'yicha ${doctor.value.experienceYrs} yillik tajribaga ega mutaxassis. ${doctor.value.clinic.name} klinikasida (${doctor.value.branch.name}) qabul qiladi.`
})

onMounted(async () => {
	const id = route.params.id as string
	doctor.value = await fetchDoctorRaw(id)
	if (!doctor.value) {
		notFound.value = true
		isLoading.value = false
		return
	}
	const clinic = await fetchClinicRaw(doctor.value.clinic.slug)
	services.value = clinic?.services ?? []

	if (token.value) {
		const favorites = await fetchMyFavorites()
		isFavorite.value = favorites.some((f) => f.doctorId === doctor.value?.id)
	}

	isLoading.value = false
})

async function toggleFavorite() {
	if (!doctor.value) return
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: route.fullPath } })
		return
	}
	isTogglingFavorite.value = true
	if (isFavorite.value) {
		await removeFavorite(doctor.value.id)
		isFavorite.value = false
	} else {
		await addFavorite(doctor.value.id)
		isFavorite.value = true
	}
	isTogglingFavorite.value = false
}
</script>

<template>
	<main v-if="isLoading">
		<CareNowHeader />
		<div class="container py-16 text-center text-sm text-ink-mute">Yuklanmoqda…</div>
	</main>
	<main v-else-if="notFound">
		<CareNowHeader />
		<div class="container py-16 text-center text-sm text-ink-mute">Shifokor topilmadi</div>
	</main>
	<main v-else-if="doctor">
		<CareNowHeader />

		<div class="container py-7">
			<div class="text-xs text-ink-mute mb-4">Bosh sahifa / Shifokorlar / {{ doctor.specialty }} / {{ doctor.name }}</div>

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-7 items-start">
				<!-- LEFT -->
				<div class="flex flex-col gap-6">
					<div class="bg-surface border border-line-soft rounded-[28px] p-7 flex flex-col sm:flex-row gap-7">
						<div class="w-[150px] shrink-0">
							<div class="w-[150px] h-[150px] rounded-3xl flex items-center justify-center text-4xl font-extrabold" style="background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color:#0369A1">{{ initials }}</div>
							<div class="flex items-center justify-center gap-2 mt-3 bg-card border border-line rounded-xl py-2">
								<UIcon name="tabler:star-filled" class="text-brand-amber text-sm" />
								<span class="text-base font-extrabold">{{ doctor.rating.toFixed(1) }}</span><span class="text-xs text-ink-mute">· {{ doctor.reviewsCount }}</span>
							</div>
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ doctor.name }}</h1>
								<UIcon name="tabler:rosette-discount-check-filled" class="text-brand-sky text-xl" />
								<div class="flex-1" />
								<button
									type="button" :disabled="isTogglingFavorite"
									class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer border border-line disabled:opacity-60"
									:class="isFavorite ? 'bg-red-50 border-red-200' : 'bg-card hover:bg-surface'"
									:aria-label="isFavorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'"
									@click="toggleFavorite"
								>
									<UIcon :name="isFavorite ? 'tabler:heart-filled' : 'tabler:heart'" class="text-lg" :class="isFavorite ? 'text-red-600' : 'text-ink-mute'" />
								</button>
							</div>
							<div class="text-base text-ink-soft mt-2">{{ doctor.specialty }} · {{ doctor.experienceYrs }} yil staj</div>
							<div class="flex items-center gap-3 mt-5 bg-card border border-line rounded-2xl p-4">
								<div class="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0" style="background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ doctor.clinic.name.slice(0, 2).toUpperCase() }}</div>
								<div class="flex-1 min-w-0"><div class="text-sm font-bold truncate">{{ doctor.clinic.name }}</div><div class="text-xs text-ink-mute mt-0.5 truncate">{{ doctor.branch.address }}</div></div>
							</div>
						</div>
					</div>

					<div class="flex gap-2 border-b border-line-soft pb-0.5 overflow-x-auto">
						<button
							v-for="(t, i) in tabs" :key="t" type="button"
							class="cursor-pointer text-sm font-bold min-h-11 flex items-center px-4 border-b-2 whitespace-nowrap"
							:class="i === activeTab ? 'text-main border-main' : 'text-ink-mute border-transparent'"
							@click="activeTab = i"
						>{{ t }}</button>
					</div>

					<div v-if="activeTab === 0">
						<h3 class="text-lg font-extrabold mb-2">Shifokor haqida</h3>
						<p class="text-base leading-relaxed text-ink-soft max-w-xl">{{ aboutText }}</p>
					</div>

					<div v-else-if="activeTab === 1">
						<h3 class="text-lg font-extrabold mb-3">Xizmatlar va narxlar</h3>
						<div v-if="!services.length" class="text-sm text-ink-mute py-6 text-center border border-line-soft rounded-3xl">Xizmatlar hali qo'shilmagan</div>
						<div v-else class="border border-line rounded-3xl overflow-hidden">
							<div v-for="s in services" :key="s.id" class="flex items-center gap-4 px-5 py-4 border-t border-line-soft first:border-t-0">
								<span class="text-lg">🦷</span>
								<div class="flex-1 text-sm font-bold">{{ s.name }}</div>
								<span class="text-sm font-extrabold">{{ s.price.toLocaleString('ru-RU') }} so'm</span>
							</div>
						</div>
					</div>

					<div v-else>
						<h3 class="text-lg font-extrabold mb-4">Sharhlar · {{ doctor.reviewsCount }}</h3>
						<div class="text-sm text-ink-mute py-6 text-center border border-line-soft rounded-3xl">Sharh matnlari hali mavjud emas</div>
					</div>
				</div>

				<!-- RIGHT: booking CTA -->
				<div class="flex flex-col gap-4 lg:sticky lg:top-6">
					<div class="bg-card border border-line rounded-3xl p-7 shadow-lg">
						<template v-if="priceFrom !== null">
							<div class="text-xs text-ink-mute">dan boshlab</div>
							<div class="flex items-baseline gap-2 mt-1">
								<span class="text-2xl font-extrabold tracking-tight">{{ priceFrom.toLocaleString('ru-RU') }}</span>
								<span class="text-sm text-ink-mute">so'm</span>
							</div>
						</template>
						<p v-else class="text-sm text-ink-mute">Narx so'rov bo'yicha</p>
						<div class="h-px bg-line-soft my-4" />
						<div class="flex items-center gap-2 text-xs text-ink-soft mb-4"><UIcon name="tabler:map-pin" class="text-sm" />{{ doctor.branch.address }}</div>
						<NuxtLink :to="`/booking/${doctor.id}`" class="block text-center w-full border-0 cursor-pointer font-bold text-base text-white bg-main py-4 rounded-2xl shadow-lg">Qabulga yozilish</NuxtLink>
						<div class="text-xs text-ink-mute text-center mt-4 leading-relaxed">{{ $t('cn.common.cancelFree') }}</div>
					</div>

					<div class="rounded-2xl p-5 bg-brand-sky-light dark:bg-surface border border-brand-sky-border">
						<div class="flex items-center gap-3"><span class="w-8 h-8 rounded-xl bg-brand-sky flex items-center justify-center shrink-0"><UIcon name="tabler:shield-check" class="text-white text-base" /></span><span class="text-sm font-extrabold">CareNow tomonidan tasdiqlangan</span></div>
					</div>
				</div>
			</div>
		</div>

		<CareNowFooter />
	</main>
</template>
