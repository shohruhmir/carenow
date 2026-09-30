<script lang="ts" setup>
import { getDoctorProfile } from '~/composables/useCareNowData'

const route = useRoute()
const doctor = computed(() => getDoctorProfile(route.params.id as string))

const micOn = ref(true)
const camOn = ref(true)
const screenOn = ref(false)
const activeTab = ref(0)
const tabs = ['Chat', 'Yozuvlar', 'Fayllar']

const files = [
	{ emoji: '📄', bg: '#E0F2FE', name: 'Davolash rejasi.pdf', meta: '248 KB · 14:41' },
	{ emoji: '💊', bg: '#D1FAE5', name: 'Retsept · Ibuprofen 400', meta: 'Elektron retsept · amal qiladi' },
	{ emoji: '🧾', bg: '#FEF3C7', name: 'Hisob-faktura #2841', meta: "250 000 so'm · to'langan" },
]
</script>

<template>
	<main v-if="doctor" class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] min-h-screen">
		<!-- video stage -->
		<div class="relative flex flex-col min-h-[500px]" style="background: #0B1220">
			<div class="absolute inset-0 overflow-hidden"><CareNowImagePlaceholder label="Shifokor video oqimi" /></div>
			<div class="absolute inset-0 pointer-events-none" style="background: linear-gradient(180deg,rgba(11,18,32,.55),transparent 26%,transparent 62%,rgba(11,18,32,.75))" />

			<div class="relative flex items-center gap-4 p-5 text-white flex-wrap">
				<span class="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-extrabold tracking-wide" style="background: rgba(239,68,68,.9)"><span class="w-1.5 h-1.5 rounded-full bg-white" />JONLI · 12:48</span>
				<span class="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold" style="background: rgba(255,255,255,.14); backdrop-filter: blur(12px)"><UIcon name="tabler:wifi" class="text-brand-emerald text-sm" />Ulanish barqaror</span>
				<div class="flex-1" />
				<span class="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold" style="background: rgba(255,255,255,.14); backdrop-filter: blur(12px)"><UIcon name="tabler:shield-lock" class="text-sm" />Uchtomonlama shifrlash</span>
			</div>

			<div class="flex-1" />

			<div class="relative flex items-end justify-between p-5 gap-4 flex-wrap">
				<div class="rounded-2xl px-5 py-3 text-white" style="background: rgba(15,23,42,.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.14)">
					<div class="text-base font-extrabold">Dr. {{ doctor.name }}</div>
					<div class="text-xs opacity-75 mt-0.5">{{ doctor.specs.split(' · ')[0] }} · {{ doctor.clinic.name }}</div>
				</div>
				<div class="relative w-[170px] h-[112px] rounded-2xl overflow-hidden shrink-0" style="border: 2px solid rgba(255,255,255,.22)">
					<CareNowImagePlaceholder label="Siz" />
					<span class="absolute bottom-2 left-2 text-xs font-bold text-white px-2 py-1 rounded-lg pointer-events-none" style="background: rgba(15,23,42,.6)">Siz</span>
				</div>
			</div>

			<div class="relative flex items-center justify-center gap-3 p-6 flex-wrap">
				<button type="button" class="w-13.5 h-13.5 rounded-2xl flex items-center justify-center cursor-pointer" style="width:54px;height:54px;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(14px)" :style="{ background: micOn ? 'rgba(255,255,255,.14)' : '#fff' }" @click="micOn = !micOn">
					<UIcon :name="micOn ? 'tabler:microphone' : 'tabler:microphone-off'" class="text-xl" :class="micOn ? 'text-white' : 'text-slate-900'" />
				</button>
				<button type="button" class="w-13.5 h-13.5 rounded-2xl flex items-center justify-center cursor-pointer" style="width:54px;height:54px;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(14px)" :style="{ background: camOn ? 'rgba(255,255,255,.14)' : '#fff' }" @click="camOn = !camOn">
					<UIcon :name="camOn ? 'tabler:video' : 'tabler:video-off'" class="text-xl" :class="camOn ? 'text-white' : 'text-slate-900'" />
				</button>
				<button type="button" class="w-13.5 h-13.5 rounded-2xl flex items-center justify-center cursor-pointer" style="width:54px;height:54px;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(14px)" :style="{ background: screenOn ? '#0369A1' : 'rgba(255,255,255,.14)' }" @click="screenOn = !screenOn">
					<UIcon name="tabler:screen-share" class="text-xl text-white" />
				</button>
				<button type="button" class="relative w-13.5 h-13.5 rounded-2xl flex items-center justify-center cursor-pointer" style="width:54px;height:54px;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(14px)" :style="{ background: activeTab === 0 ? '#fff' : 'rgba(255,255,255,.14)' }" @click="activeTab = 0">
					<UIcon name="tabler:message-circle" class="text-xl" :class="activeTab === 0 ? 'text-slate-900' : 'text-white'" />
					<span class="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500" style="border: 1.5px solid rgba(11,18,32,.9)" />
				</button>
				<button type="button" class="w-13.5 h-13.5 rounded-2xl flex items-center justify-center cursor-pointer" style="width:54px;height:54px;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(14px)" :style="{ background: activeTab === 2 ? '#fff' : 'rgba(255,255,255,.14)' }" @click="activeTab = 2">
					<UIcon name="tabler:folder" class="text-xl" :class="activeTab === 2 ? 'text-slate-900' : 'text-white'" />
				</button>
				<div class="w-3.5" />
				<NuxtLink :to="`/doctors/${doctor.id}`" class="h-13.5 px-7 rounded-2xl flex items-center gap-2 cursor-pointer text-white text-sm font-bold shadow-lg" style="height:54px;background:#DC2626">
					<UIcon name="tabler:phone-x" class="text-lg" />Tugatish
				</NuxtLink>
			</div>
		</div>

		<!-- side panel -->
		<div class="border-l border-line-soft flex flex-col bg-card">
			<div class="flex gap-1 p-2 m-4 mb-0 bg-surface rounded-2xl">
				<button
					v-for="(t, i) in tabs" :key="t" type="button"
					class="flex-1 text-center cursor-pointer text-xs font-bold min-h-11 flex items-center justify-center rounded-xl"
					:class="i === activeTab ? 'text-ink bg-card shadow-sm' : 'text-ink-mute'"
					@click="activeTab = i"
				>{{ t }}</button>
			</div>

			<!-- CHAT -->
			<div v-if="activeTab === 0" class="flex-1 flex flex-col overflow-hidden">
				<div class="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
					<div class="text-center text-xs text-ink-mute font-semibold">Bugun · 14:32</div>
					<div class="self-start max-w-[82%] bg-surface rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">Assalomu alaykum! Rentgen suratingizni ko'rdim. Pastki jag'da zichlik bor, kapa bilan ham to'g'rilash mumkin.</div>
					<div class="self-end max-w-[82%] bg-main text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">Kapa qancha vaqt oladi?</div>
					<div class="self-start max-w-[82%] bg-surface rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">Sizning holatingizda taxminan 9–11 oy. Rejani hozir yuboraman.</div>
					<div class="self-start max-w-[82%] flex items-center gap-3 bg-brand-sky-light dark:bg-surface border border-brand-sky-border rounded-2xl px-4 py-3">
						<span class="w-9.5 h-9.5 rounded-xl bg-brand-sky flex items-center justify-center shrink-0" style="width:38px;height:38px"><UIcon name="tabler:file-text" class="text-white text-lg" /></span>
						<div><div class="text-sm font-bold">Davolash rejasi.pdf</div><div class="text-xs text-ink-mute mt-0.5">248 KB · yuklab olish</div></div>
					</div>
					<div class="self-end text-xs text-ink-mute font-semibold">O'qildi ✓✓</div>
				</div>
				<div class="p-4 border-t border-line-soft flex items-center gap-3">
					<span class="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0 cursor-pointer"><UIcon name="tabler:paperclip" class="text-lg text-ink-mute" /></span>
					<div class="flex-1 bg-surface rounded-xl px-4 py-3 text-sm text-ink-mute">Xabar yozing…</div>
					<span class="w-10 h-10 rounded-xl bg-brand-sky flex items-center justify-center shrink-0 cursor-pointer"><UIcon name="tabler:send" class="text-lg text-white" /></span>
				</div>
			</div>

			<!-- NOTES -->
			<div v-else-if="activeTab === 1" class="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
				<div>
					<div class="text-xs font-extrabold tracking-wide uppercase text-ink-mute mb-2">Shikoyat</div>
					<div class="bg-surface border border-line-soft rounded-2xl px-4 py-3 text-sm leading-relaxed text-ink-soft">Pastki jag'dagi tishlar zich joylashgan, chap tomonda chaynashda noqulaylik. 3 oydan beri.</div>
				</div>
				<div>
					<div class="text-xs font-extrabold tracking-wide uppercase text-ink-mute mb-2">Tashxis (dastlabki)</div>
					<div class="flex gap-2 flex-wrap">
						<span class="text-xs font-bold text-brand-amber-text bg-brand-amber-light px-3 py-2 rounded-lg">Tishlar kraudingi · K07.3</span>
						<span class="text-xs font-bold text-main bg-brand-sky-light px-3 py-2 rounded-lg">II sinf okklyuziya</span>
					</div>
				</div>
				<div>
					<div class="text-xs font-extrabold tracking-wide uppercase text-ink-mute mb-2">Tavsiya</div>
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-3 bg-surface border border-line-soft rounded-xl px-4 py-3"><span class="w-5.5 h-5.5 rounded-lg bg-main text-white flex items-center justify-center text-xs font-extrabold" style="width:22px;height:22px">1</span><span class="text-sm font-semibold">Klinikada 3D skanerlash · 1 hafta ichida</span></div>
						<div class="flex items-center gap-3 bg-surface border border-line-soft rounded-xl px-4 py-3"><span class="w-5.5 h-5.5 rounded-lg bg-main text-white flex items-center justify-center text-xs font-extrabold" style="width:22px;height:22px">2</span><span class="text-sm font-semibold">Professional tozalash (kapadan oldin)</span></div>
						<div class="flex items-center gap-3 bg-surface border border-line-soft rounded-xl px-4 py-3"><span class="w-5.5 h-5.5 rounded-lg bg-main text-white flex items-center justify-center text-xs font-extrabold" style="width:22px;height:22px">3</span><span class="text-sm font-semibold">Aligner kursi · 9–11 oy</span></div>
					</div>
				</div>
				<div class="flex-1" />
				<button type="button" class="w-full border-0 cursor-pointer font-bold text-sm text-white bg-brand-emerald py-4 rounded-2xl shadow-lg">Xulosani bemorga yuborish</button>
			</div>

			<!-- FILES -->
			<div v-else class="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
				<div class="grid grid-cols-2 gap-3">
					<div class="border border-line rounded-2xl overflow-hidden"><div class="h-24"><CareNowImagePlaceholder label="OPTG" /></div><div class="px-3 py-2 text-xs font-bold">Panoramik OPTG</div></div>
					<div class="border border-line rounded-2xl overflow-hidden"><div class="h-24"><CareNowImagePlaceholder label="intraoral" /></div><div class="px-3 py-2 text-xs font-bold">Intraoral foto</div></div>
				</div>
				<div v-for="f in files" :key="f.name" class="flex items-center gap-3 border border-line rounded-2xl px-4 py-3">
					<span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" :style="{ background: f.bg }">{{ f.emoji }}</span>
					<div class="flex-1 min-w-0"><div class="text-sm font-bold truncate">{{ f.name }}</div><div class="text-xs text-ink-mute mt-0.5">{{ f.meta }}</div></div>
					<UIcon name="tabler:download" class="text-lg text-ink-mute" />
				</div>
				<div class="border-2 border-dashed border-line rounded-2xl p-6 text-center text-xs text-ink-mute font-semibold">Fayl yuklash uchun bu yerga tashlang</div>
			</div>
		</div>
	</main>
</template>
