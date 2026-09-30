<script lang="ts" setup>
import type { DoctorSummary } from '~/composables/useDoctorsApi'
import { aggregateSpecialties } from '~/composables/useSpecialtiesApi'

const { t } = useSiteContent()
const router = useRouter()
const city = useCity()
const cityModal = useCityModal()
const heroQuery = ref('')
function goSearch(q?: string) {
	router.push({ path: '/doctors', query: (q ?? heroQuery.value) ? { q: q ?? heroQuery.value } : {} })
}

const popularSearches = computed(() => [
	t('home.popularSearches.1', 'Implant'),
	t('home.popularSearches.2', "Breket o'rnatish"),
	t('home.popularSearches.3', 'Professional tozalash'),
	t('home.popularSearches.4', 'Plomba'),
	t('home.popularSearches.5', 'Bolalar stomatologiyasi'),
	t('home.popularSearches.6', 'Oqartirish'),
])

const { fetchDoctors } = useDoctorsApi()
const allDoctors = ref<DoctorSummary[]>([])
const isLoadingDoctors = ref(true)

const specs = computed(() => aggregateSpecialties(allDoctors.value))

// GET /doctors already orders by rating desc, so the first 3 are the top-rated.
const topDoctors = computed(() => allDoctors.value.slice(0, 3))
const totalDoctors = computed(() => allDoctors.value.length)

onMounted(async () => {
	isLoadingDoctors.value = true
	allDoctors.value = await fetchDoctors()
	isLoadingDoctors.value = false
})
</script>

<template>
	<main>
		<CareNowHeader />

		<!-- hero -->
		<section style="background: linear-gradient(180deg, var(--color-surface), var(--color-card))">
			<div class="container py-14 md:py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 md:gap-14 items-start">
				<div data-aos="fade-up">
					<div class="inline-flex items-center gap-2 text-xs font-bold text-brand-emerald-text bg-brand-emerald-light px-4 py-2 rounded-full">
						<span class="w-1.5 h-1.5 rounded-full bg-brand-emerald" />{{ t('home.hero.badge', "24/7 onlayn yozilish · yashirin komissiyasiz") }}
					</div>
					<h1 class="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
						{{ t('home.hero.title', "Ishonchli stomatologni toping va 3 bosqichda yoziling") }}
					</h1>
					<p class="mt-4 text-lg text-ink-soft leading-relaxed max-w-xl">
						{{ t('home.hero.subtitle', "2 000+ tekshirilgan shifokor, haqiqiy bemor sharhlari va CareNow orqali maxsus chegirmali narxlar.") }}
					</p>

					<form class="mt-8 flex flex-col sm:flex-row bg-card border border-line rounded-[20px] shadow-lg overflow-hidden" @submit.prevent="goSearch()">
						<div class="flex-[1.4] flex items-center gap-3 px-5 min-h-16">
							<UIcon name="tabler:search" class="text-ink-mute text-xl shrink-0" />
							<input v-model="heroQuery" type="text" class="flex-1 outline-none text-base placeholder:text-ink-mute" placeholder="Xizmat, shifokor yoki klinika…" />
						</div>
						<div class="hidden sm:block w-px bg-line-soft my-3" />
						<button type="button" class="flex-[.8] flex items-center gap-3 px-5 py-3 sm:py-0 cursor-pointer" @click="cityModal = true">
							<UIcon name="tabler:map-pin" class="text-ink-mute text-lg" /><span class="text-base font-semibold">{{ city }}</span>
						</button>
						<button type="submit" class="m-2 rounded-xl bg-main text-white font-bold text-base px-9 py-4 cursor-pointer hover:bg-main-hover transition-colors">Qidirish</button>
					</form>

					<div class="flex gap-2 mt-5 flex-wrap">
						<button
							v-for="p in popularSearches" :key="p" type="button"
							class="text-xs font-semibold text-ink-soft bg-surface min-h-11 inline-flex items-center px-4.5 rounded-full cursor-pointer hover:bg-line-soft transition-colors"
							@click="goSearch(p)"
						>{{ p }}</button>
					</div>

					<div class="flex gap-10 mt-9 flex-wrap">
						<div><div class="text-2xl font-extrabold tracking-tight">{{ t('home.stats.doctors.value', '2 000+') }}</div><div class="text-xs text-ink-mute mt-0.5">{{ t('home.stats.doctors.label', 'shifokor') }}</div></div>
						<div><div class="text-2xl font-extrabold tracking-tight">{{ t('home.stats.clinics.value', '500+') }}</div><div class="text-xs text-ink-mute mt-0.5">{{ t('home.stats.clinics.label', 'klinika') }}</div></div>
						<div><div class="text-2xl font-extrabold tracking-tight">{{ t('home.stats.bookings.value', '120k+') }}</div><div class="text-xs text-ink-mute mt-0.5">{{ t('home.stats.bookings.label', 'yozilish') }}</div></div>
						<div><div class="text-2xl font-extrabold tracking-tight text-amber-700">{{ t('home.stats.rating.value', '4.9 ★') }}</div><div class="text-xs text-ink-mute mt-0.5">{{ t('home.stats.rating.label', "o'rtacha reyting") }}</div></div>
					</div>
				</div>

				<div class="relative hidden lg:block" data-aos="fade-left">
					<div class="rounded-[28px] overflow-hidden border border-line h-[420px]">
						<CareNowImagePlaceholder label="Klinika fotosi — tabassumli bemor + shifokor" />
					</div>
					<div class="absolute left-5 bottom-6 bg-card rounded-2xl px-5 py-4 shadow-xl flex gap-3 items-center border border-line-soft">
						<div class="w-11 h-11 rounded-2xl bg-brand-emerald-light flex items-center justify-center"><UIcon name="tabler:check" class="text-brand-emerald text-xl" /></div>
						<div><div class="text-sm font-bold">Yozilish tasdiqlandi</div><div class="text-xs text-ink-mute mt-0.5">Dr. Karimova · Juma, 14:30</div></div>
					</div>
					<div class="absolute right-5 top-6 bg-card rounded-2xl px-4 py-3 shadow-md flex gap-3 items-center border border-line-soft">
						<div class="flex">
							<span class="w-7 h-7 rounded-full bg-brand-sky border-2 border-white flex items-center justify-center text-white text-xs font-extrabold">A</span>
							<span class="w-7 h-7 rounded-full bg-brand-emerald border-2 border-white -ml-2.5 flex items-center justify-center text-white text-xs font-extrabold">M</span>
							<span class="w-7 h-7 rounded-full bg-brand-amber border-2 border-white -ml-2.5 flex items-center justify-center text-white text-xs font-extrabold">S</span>
						</div>
						<div class="text-xs font-semibold text-ink-soft">Bugun <b class="text-ink">340</b> bemor yozildi</div>
					</div>
				</div>
			</div>
		</section>

		<!-- specialties -->
		<section class="container py-12">
			<div class="flex justify-between items-baseline">
				<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight" data-aos="fade-right">{{ t('home.specialties.title', "Stomatologiya yo'nalishlari") }}</h2>
				<NuxtLink to="/services" class="text-sm font-bold text-main">{{ $t('cn.buttons.seeAll') }} →</NuxtLink>
			</div>
			<div v-if="isLoadingDoctors" class="text-sm text-ink-mute py-6">Yuklanmoqda…</div>
			<div v-else-if="!specs.length" class="text-sm text-ink-mute py-6">Hali shifokor qo'shilmagan</div>
			<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
				<NuxtLink
					v-for="s in specs" :key="s.name" :to="{ path: '/doctors', query: { q: s.name } }"
					class="flex items-center gap-4 bg-surface border border-line-soft rounded-2xl px-5 py-4 hover:border-line transition-colors"
					data-aos="fade-up"
				>
					<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" :style="{ background: s.bg }">{{ s.emoji }}</div>
					<div><div class="text-base font-bold">{{ s.name }}</div><div class="text-xs text-ink-mute mt-0.5">{{ s.count }} shifokor</div></div>
				</NuxtLink>
			</div>
		</section>

		<!-- top doctors -->
		<section class="container py-12">
			<div class="flex justify-between items-baseline">
				<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight" data-aos="fade-right">{{ t('home.topDoctors.title', 'Eng yaxshi stomatologlar') }} · {{ city }}</h2>
				<NuxtLink to="/doctors" class="text-sm font-bold text-main">Hammasi ({{ totalDoctors }}) →</NuxtLink>
			</div>
			<div v-if="isLoadingDoctors" class="text-sm text-ink-mute py-6">Yuklanmoqda…</div>
			<div v-else-if="!topDoctors.length" class="text-sm text-ink-mute py-6">Hali shifokor qo'shilmagan</div>
			<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
				<CareNowDoctorCard v-for="d in topDoctors" :key="d.id" :doctor="d" data-aos="fade-up" />
			</div>
		</section>

		<!-- how it works -->
		<section class="container py-14">
			<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-center">{{ t('home.steps.title', "3 bosqichda yozilish") }}</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
				<div class="bg-surface border border-line-soft rounded-3xl p-7 text-center">
					<div class="w-13 h-13 rounded-2xl bg-brand-sky-light flex items-center justify-center mx-auto text-xl font-extrabold text-main" style="width:52px;height:52px">1</div>
					<div class="text-lg font-extrabold mt-4">{{ t('home.steps.1.title', 'Toping') }}</div>
					<div class="text-sm text-ink-mute mt-2 leading-relaxed">{{ t('home.steps.1.desc', "Xizmat yoki shifokorni qidiring, sharh va narxlarni solishtiring") }}</div>
				</div>
				<div class="bg-surface border border-line-soft rounded-3xl p-7 text-center">
					<div class="w-13 h-13 rounded-2xl bg-brand-emerald-light flex items-center justify-center mx-auto text-xl font-extrabold text-brand-emerald-text" style="width:52px;height:52px">2</div>
					<div class="text-lg font-extrabold mt-4">{{ t('home.steps.2.title', 'Vaqtni tanlang') }}</div>
					<div class="text-sm text-ink-mute mt-2 leading-relaxed">{{ t('home.steps.2.desc', "Jonli kalendardan bo'sh soatni tanlang — telefon qilish shart emas") }}</div>
				</div>
				<div class="bg-surface border border-line-soft rounded-3xl p-7 text-center">
					<div class="w-13 h-13 rounded-2xl bg-brand-amber-light flex items-center justify-center mx-auto text-xl font-extrabold text-brand-amber-text" style="width:52px;height:52px">3</div>
					<div class="text-lg font-extrabold mt-4">{{ t('home.steps.3.title', 'Yoziling') }}</div>
					<div class="text-sm text-ink-mute mt-2 leading-relaxed">{{ t('home.steps.3.desc', "Tasdiqlash SMS orqali keladi. CareNow chegirmasi avtomatik qo'llanadi") }}</div>
				</div>
			</div>
		</section>

		<!-- B2B banner -->
		<section class="container pb-6">
			<div class="rounded-[28px] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 text-white relative overflow-hidden" style="background: linear-gradient(135deg,#0F172A,#1E293B)">
				<div class="absolute -right-16 -top-16 w-64 h-64 rounded-full" style="background: rgba(14,165,233,.18)" />
				<div class="relative">
					<div class="text-xs font-bold tracking-wider uppercase text-sky-400">{{ t('home.b2b.eyebrow', 'Klinikalar uchun') }}</div>
					<h2 class="mt-3 text-3xl font-extrabold tracking-tight leading-snug">{{ t('home.b2b.title', "Klinikangizni CareNow'ga ulang — bemorlar o'zi kelsin") }}</h2>
					<p class="mt-4 text-base text-slate-300 leading-relaxed max-w-lg">{{ t('home.b2b.desc', "Onlayn yozuv kabineti, jadval boshqaruvi, bemorlar bazasi va analitika — shifokorlaringiz faqat davolash bilan shug'ullansin.") }}</p>
					<div class="flex gap-4 mt-7 flex-wrap">
						<NuxtLink to="/business" class="font-bold text-slate-900 bg-white px-7 py-4 rounded-2xl">Klinikani ro'yxatdan o'tkazish</NuxtLink>
						<NuxtLink to="/business" class="font-bold text-white px-7 py-4 rounded-2xl border border-white/20" style="background: rgba(255,255,255,.12)">Demo ko'rish</NuxtLink>
					</div>
				</div>
				<div class="relative flex flex-col gap-3 justify-center">
					<div class="rounded-2xl px-5 py-4 flex gap-3 items-center border border-white/10" style="background: rgba(255,255,255,.08)">
						<div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(14,165,233,.25)">📅</div>
						<div><div class="text-sm font-bold">{{ t('home.b2b.feature.1.title', 'Onlayn yozuv 24/7') }}</div><div class="text-xs text-slate-400 mt-0.5">{{ t('home.b2b.feature.1.desc', 'Resepshnsiz ham ishlaydi') }}</div></div>
					</div>
					<div class="rounded-2xl px-5 py-4 flex gap-3 items-center border border-white/10" style="background: rgba(255,255,255,.08)">
						<div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(16,185,129,.25)">📈</div>
						<div><div class="text-sm font-bold">{{ t('home.b2b.feature.2.title', '+40% yangi bemor') }}</div><div class="text-xs text-slate-400 mt-0.5">{{ t('home.b2b.feature.2.desc', "Birinchi 3 oyda o'rtacha") }}</div></div>
					</div>
					<div class="rounded-2xl px-5 py-4 flex gap-3 items-center border border-white/10" style="background: rgba(255,255,255,.08)">
						<div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(245,158,11,.25)">🦷</div>
						<div><div class="text-sm font-bold">{{ t('home.b2b.feature.3.title', 'Odontogram va EMR') }}</div><div class="text-xs text-slate-400 mt-0.5">{{ t('home.b2b.feature.3.desc', 'Tish formulasi, rentgen, retseptlar') }}</div></div>
					</div>
				</div>
			</div>
		</section>

		<!-- app banner -->
		<section class="container py-6">
			<div class="rounded-[28px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 text-white relative overflow-hidden" style="background: linear-gradient(135deg,#0EA5E9,#0284C7)">
				<div class="flex-1 relative">
					<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('home.app.title', "CareNow ilovasini yuklab oling") }}</h2>
					<p class="mt-3 text-base opacity-90 leading-relaxed max-w-md">{{ t('home.app.desc', "Shifokor qidiring, eslatmalar oling, oila a'zolaringizni yozing va tibbiy kartangizni bitta ilovada saqlang.") }}</p>
					<div class="flex gap-3 mt-6 flex-wrap">
						<div class="bg-slate-900 rounded-xl px-5 py-3 flex items-center gap-2"><div class="text-left"><div class="text-[11px] opacity-70">Download on the</div><div class="text-sm font-bold mt-0.5">App Store</div></div></div>
						<div class="bg-slate-900 rounded-xl px-5 py-3 flex items-center gap-2"><span class="text-base">▶</span><div class="text-left"><div class="text-[11px] opacity-70">GET IT ON</div><div class="text-sm font-bold mt-0.5">Google Play</div></div></div>
					</div>
				</div>
				<div class="w-full md:w-[220px] h-[160px] md:h-[200px] rounded-3xl border border-white/25 shrink-0" style="background: rgba(255,255,255,.14)" />
			</div>
		</section>

		<CareNowFooter />
	</main>
</template>
