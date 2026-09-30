<script lang="ts" setup>
import type { DoctorSummary } from '~/composables/useCareNowData'

const route = useRoute()
const router = useRouter()
const { fetchDoctors } = useDoctorsApi()

const query = computed(() => (route.query.q as string) || '')
const searchInput = ref(query.value)
function submitSearch() {
	router.push({ path: '/doctors', query: searchInput.value ? { q: searchInput.value } : {} })
}

const doctors = ref<DoctorSummary[]>([])
const isLoading = ref(true)

async function loadDoctors() {
	isLoading.value = true
	doctors.value = await fetchDoctors({ specialty: query.value })
	isLoading.value = false
}

onMounted(loadDoctors)
watch(query, loadDoctors)

const districts = ['Chilonzor', 'Yunusobod', "Mirzo Ulug'bek", 'Sergeli']
const activeDistrict = ref(0)
const sortOptions = ['Reyting boʻyicha', 'Narx boʻyicha', 'Staj boʻyicha']
const activeSort = ref(0)
const onlyToday = ref(true)
</script>

<template>
	<main>
		<CareNowHeader />

		<div class="border-b border-line-soft px-6 py-4">
			<form class="max-w-2xl flex items-center gap-3 bg-surface rounded-xl px-4 h-12" @submit.prevent="submitSearch">
				<UIcon name="tabler:search" class="text-main text-lg shrink-0" />
				<input v-model="searchInput" type="text" class="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink-mute placeholder:font-normal" placeholder="Xizmat, shifokor yoki klinika…" />
			</form>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_360px] gap-0 lg:pb-10">
			<!-- filters -->
			<aside class="px-6 py-8 border-b lg:border-b-0 lg:border-r border-line-soft">
				<div class="text-xs text-ink-mute mb-2">Bosh sahifa / Shifokorlar<template v-if="query"> / {{ query }}</template></div>
				<h1 class="text-2xl font-extrabold tracking-tight mb-6">{{ query || 'Shifokorlar' }}, Toshkent <span class="text-ink-mute font-semibold">({{ doctors.length }})</span></h1>

				<div class="text-xs font-extrabold mb-3">Saralash</div>
				<div class="flex flex-col gap-2 text-sm">
					<label v-for="(s, i) in sortOptions" :key="s" class="flex items-center gap-3 cursor-pointer" :class="activeSort === i ? 'font-bold text-main' : 'text-ink-soft'">
						<input v-model="activeSort" :value="i" type="radio" name="sort" class="accent-main w-4 h-4" />{{ s }}
					</label>
				</div>

				<div class="h-px bg-line-soft my-5" />
				<div class="text-xs font-extrabold mb-3">Qulayliklar</div>
				<div class="flex flex-col gap-3 text-sm text-ink-soft">
					<label class="flex items-center gap-3 cursor-pointer" :class="onlyToday ? 'font-bold text-ink' : ''">
						<input v-model="onlyToday" type="checkbox" class="accent-main w-4 h-4 rounded" />Bugun bo'sh joy bor
					</label>
					<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" class="accent-main w-4 h-4 rounded" />Bolalar stomatologi</label>
					<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" class="accent-main w-4 h-4 rounded" />Yaqin-atrofda</label>
					<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" class="accent-main w-4 h-4 rounded" />Onlayn konsultatsiya</label>
				</div>

				<div class="h-px bg-line-soft my-5" />
				<div class="text-xs font-extrabold mb-4">Narx · 500 ming so'mgacha</div>
				<div class="h-1.5 bg-surface rounded relative">
					<div class="absolute left-0 h-full bg-main rounded" style="width: 60%" />
					<div class="absolute h-5 w-5 rounded-full bg-white border-[3px] border-main shadow" style="left: 58%; top: 50%; transform: translateY(-50%)" />
				</div>

				<div class="h-px bg-line-soft my-5" />
				<div class="text-xs font-extrabold mb-3">Tuman</div>
				<div class="flex flex-wrap gap-2">
					<button
						v-for="(d, i) in districts" :key="d" type="button"
						class="text-xs font-bold px-3 py-2 rounded-full cursor-pointer"
						:class="i === activeDistrict ? 'text-white bg-main' : 'text-ink-soft bg-surface'"
						@click="activeDistrict = i"
					>{{ d }}</button>
				</div>
			</aside>

			<!-- results -->
			<section class="px-6 py-8 bg-surface flex flex-col gap-4">
				<div class="inline-flex items-center gap-2 text-sm font-semibold text-brand-emerald-text bg-brand-emerald-light px-4 py-3 rounded-xl w-fit">
					<UIcon name="tabler:shield-check" class="text-base" />Yashirin komissiyasiz qulay yozilish
				</div>
				<div v-if="isLoading" class="text-sm text-ink-mute py-10 text-center">Yuklanmoqda…</div>
				<div v-else-if="!doctors.length" class="text-sm text-ink-mute py-10 text-center">Bu yo'nalish bo'yicha shifokor topilmadi</div>
				<CareNowDoctorCard v-for="d in doctors" :key="d.id" :doctor="d" variant="list" />
				<div v-if="query === 'Ortodont'" class="bg-card border border-line rounded-[20px] p-6 mt-2">
					<div class="text-base font-extrabold">Ortodont kim?</div>
					<p class="text-sm text-ink-mute leading-relaxed mt-2">Ortodont — tish qatori va prikusni breket, plastinka va kapalar yordamida to'g'irlaydigan shifokor. Sahifadagi ma'lumot tanishish uchun; davolanish uchun shifokorga murojaat qiling. <span class="text-main font-bold">{{ $t('cn.buttons.readMore') }}</span></p>
				</div>
			</section>

			<!-- map -->
			<aside class="hidden lg:block relative bg-[#DCE6EC] border-l border-line-soft overflow-hidden">
				<div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg,transparent,transparent 58px,#CBD8E0 58px,#CBD8E0 60px), repeating-linear-gradient(90deg,transparent,transparent 58px,#CBD8E0 58px,#CBD8E0 60px)" />
				<div class="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg">Xaritada · {{ doctors.length }} shifokor</div>
				<div class="absolute top-[130px] left-[70px] bg-main text-white text-sm font-extrabold px-3 py-2 rounded-xl shadow-lg">250 ming</div>
				<div class="absolute top-[240px] left-[160px] bg-white text-sm font-extrabold px-3 py-2 rounded-xl shadow-md">180 ming</div>
				<div class="absolute top-[380px] left-[90px] bg-white text-sm font-extrabold px-3 py-2 rounded-xl shadow-md">320 ming</div>
				<div class="absolute top-[470px] left-[220px] bg-white text-sm font-extrabold px-3 py-2 rounded-xl shadow-md">150 ming</div>
			</aside>
		</div>

		<CareNowFooter />
	</main>
</template>
