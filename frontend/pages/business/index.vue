<script lang="ts" setup>
import { bizTariffs } from '~/composables/useCareNowData'

const { t: tc } = useSiteContent()
const { createLead } = useBusinessApi()

const form = reactive({ name: '', city: 'Toshkent', branches: '2–5', phone: '' })
const isSubmitting = ref(false)
const errorMessage = ref('')
const submitted = ref(false)
const fullPhone = computed(() => `+998${form.phone.replace(/\s/g, '')}`)

async function submitLead() {
	errorMessage.value = ''
	if (form.name.trim().length < 2) {
		errorMessage.value = "Klinika nomini kiriting"
		return
	}
	if (!/^\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
		errorMessage.value = "Telefon raqamni to'liq kiriting (9 ta raqam)"
		return
	}
	isSubmitting.value = true
	const res = await createLead({ clinicName: form.name, city: form.city, branchCount: form.branches, phone: fullPhone.value })
	isSubmitting.value = false
	if (!res.success) {
		errorMessage.value = res.message || 'Xatolik yuz berdi'
		return
	}
	submitted.value = true
}
</script>

<template>
	<main>
		<CareNowHeader />

		<section style="background: linear-gradient(180deg, var(--color-surface), var(--color-card))">
			<div class="container py-14 md:py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_minmax(0,1fr)] gap-10">
				<div>
					<div class="inline-flex items-center gap-2 text-xs font-bold text-main bg-brand-sky-light px-4 py-2 rounded-full">{{ tc('business.hero.badge', 'Klinikalar uchun · CareNow Business') }}</div>
					<h1 class="mt-5 text-3xl md:text-[44px] font-extrabold tracking-tight leading-[1.1]">{{ tc('business.hero.title', "Bo'sh kreslolaringizni bemorlar bilan to'ldiring") }}</h1>
					<p class="mt-4 text-base text-ink-soft leading-relaxed max-w-lg">{{ tc('business.hero.desc', "CareNow'dagi 120 000+ faol bemor auditoriyasiga ulaning. Onlayn yozuv, jadval, bemorlar bazasi, odontogram va analitika — bitta kabinetda.") }}</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-lg">
						<div class="flex gap-3 items-center"><span class="w-9.5 h-9.5 rounded-xl bg-brand-emerald-light flex items-center justify-center shrink-0" style="width:38px;height:38px"><UIcon name="tabler:chart-line" class="text-brand-emerald-text text-lg" /></span><div class="text-sm font-bold">{{ tc('business.feature.1.title', '+40% yangi bemor') }}<div class="text-xs text-ink-mute font-semibold">{{ tc('business.feature.1.desc', 'birinchi 3 oyda') }}</div></div></div>
						<div class="flex gap-3 items-center"><span class="w-9.5 h-9.5 rounded-xl bg-brand-sky-light flex items-center justify-center shrink-0" style="width:38px;height:38px"><UIcon name="tabler:calendar" class="text-main text-lg" /></span><div class="text-sm font-bold">{{ tc('business.feature.2.title', "−30% yo'qolgan qabul") }}<div class="text-xs text-ink-mute font-semibold">{{ tc('business.feature.2.desc', 'avto-eslatmalar bilan') }}</div></div></div>
						<div class="flex gap-3 items-center"><span class="w-9.5 h-9.5 rounded-xl bg-brand-amber-light flex items-center justify-center shrink-0 text-lg" style="width:38px;height:38px">🦷</span><div class="text-sm font-bold">{{ tc('business.feature.3.title', 'Odontogram + EMR') }}<div class="text-xs text-ink-mute font-semibold">{{ tc('business.feature.3.desc', 'tish formulasi, rentgen') }}</div></div></div>
						<div class="flex gap-3 items-center"><span class="w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0" style="width:38px;height:38px;background:#EDE9FE"><UIcon name="tabler:users" class="text-violet-600 text-lg" /></span><div class="text-sm font-bold">{{ tc('business.feature.4.title', 'Cheksiz filiallar') }}<div class="text-xs text-ink-mute font-semibold">{{ tc('business.feature.4.desc', 'yagona boshqaruv') }}</div></div></div>
					</div>
				</div>

				<div v-if="submitted" class="bg-card border border-line rounded-3xl p-8 shadow-xl h-fit text-center">
					<div class="w-14 h-14 rounded-full bg-brand-emerald-light flex items-center justify-center mx-auto"><UIcon name="tabler:check" class="text-brand-emerald text-2xl" /></div>
					<div class="text-xl font-extrabold mt-4">Ariza qabul qilindi!</div>
					<p class="text-sm text-ink-mute mt-2 leading-relaxed">Menejerimiz 1 ish kunida {{ fullPhone }} raqamiga bog'lanadi.</p>
				</div>
				<form v-else class="bg-card border border-line rounded-3xl p-8 shadow-xl h-fit" @submit.prevent="submitLead">
					<div class="text-xl font-extrabold">Ariza qoldiring</div>
					<div class="text-xs text-ink-mute mt-1">Menejerimiz 1 ish kunida bog'lanadi</div>
					<label class="block text-xs font-bold text-ink-soft mt-5 mb-1.5">Klinika nomi</label>
					<input v-model="form.name" type="text" placeholder="Smile Dental" class="w-full border-[1.5px] border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-main" />
					<div class="grid grid-cols-2 gap-3">
						<div><label class="block text-xs font-bold text-ink-soft mt-3.5 mb-1.5">Shahar</label><input v-model="form.city" type="text" class="w-full border-[1.5px] border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-main" /></div>
						<div><label class="block text-xs font-bold text-ink-soft mt-3.5 mb-1.5">Filiallar soni</label><input v-model="form.branches" type="text" class="w-full border-[1.5px] border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-main" /></div>
					</div>
					<label class="block text-xs font-bold text-ink-soft mt-3.5 mb-1.5">Telefon</label>
					<div class="flex items-center gap-2 border-[1.5px] border-line rounded-xl px-4 py-3 focus-within:border-main">
						<span class="text-sm font-bold text-ink-soft border-r border-line pr-2">+998</span>
						<input v-model="form.phone" type="tel" placeholder="90 123 45 67" class="flex-1 min-w-0 outline-none text-sm" />
					</div>
					<p v-if="errorMessage" class="text-xs font-semibold text-red-600 mt-2">{{ errorMessage }}</p>
					<button type="submit" :disabled="isSubmitting" class="w-full border-0 cursor-pointer font-bold text-base text-white bg-main py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60">{{ isSubmitting ? 'Yuborilmoqda…' : 'Ariza yuborish' }}</button>
				</form>
			</div>
		</section>

		<section class="container py-8 pb-16">
			<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-7">{{ tc('business.tariffs.title', 'Tariflar') }}</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
				<div
					v-for="t in bizTariffs" :key="t.id"
					class="relative rounded-3xl p-8"
					:class="[t.highlight ? 'border-2 border-brand-sky shadow-2xl' : 'border border-line', t.dark ? 'bg-slate-900 text-white' : '']"
				>
					<span v-if="t.badge" class="absolute -top-3 left-8 text-xs font-extrabold text-white bg-main px-4 py-1 rounded-lg">{{ t.badge }}</span>
					<div class="text-base font-extrabold" :class="t.highlight ? 'text-main' : t.dark ? 'text-sky-400' : 'text-ink-soft'">{{ t.name }}</div>
					<div class="text-3xl font-extrabold mt-3 tracking-tight">{{ t.price }}</div>
					<div class="text-xs mt-1" :class="t.dark ? 'text-slate-400' : 'text-ink-mute'">{{ t.note }}</div>
					<div class="h-px my-5" :class="t.dark ? 'bg-white/10' : 'bg-line-soft'" />
					<div class="flex flex-col gap-3 text-sm" :class="t.dark ? 'text-slate-300' : 'text-ink-soft'">
						<span v-for="f in t.features" :key="f.text" :class="!f.ok ? 'text-ink-mute' : ''">{{ f.ok ? '✓' : '✗' }} {{ f.text }}</span>
					</div>
					<button
						type="button"
						class="w-full cursor-pointer font-bold text-sm py-3 rounded-xl mt-6"
						:class="t.highlight ? 'text-white bg-main shadow-lg' : t.dark ? 'text-slate-900 bg-white' : 'text-ink bg-surface'"
					>{{ t.cta }}</button>
				</div>
			</div>
		</section>

		<CareNowFooter />
	</main>
</template>
