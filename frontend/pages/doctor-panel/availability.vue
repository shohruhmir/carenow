<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { DoctorPortalProfile } from '~/composables/useDoctorPortalApi'

const router = useRouter()
const token = useToken()
const { fetchMe } = useAuth()
const { fetchMyProfile, fetchMyAvailability, setMyAvailability } = useDoctorPortalApi()

const navItems = [
	{ icon: 'tabler:user', label: 'Profil', to: '/doctor-panel' },
	{ icon: 'tabler:clock', label: 'Ish vaqti', to: '/doctor-panel/availability' },
	{ icon: 'tabler:calendar-event', label: 'Bronlar', to: '/doctor-panel/bookings' },
]

const DAY_LABELS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const SLOT_OPTIONS = [15, 20, 30, 45, 60]

interface DayState { enabled: boolean; startTime: string; endTime: string }

const user = ref<AuthUser | null>(null)
const doctor = ref<DoctorPortalProfile | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const isSaving = ref(false)
const saveError = ref('')
const savedAt = ref<number | null>(null)

const slotMinutes = ref(30)
const days = ref<DayState[]>(Array.from({ length: 7 }, () => ({ enabled: false, startTime: '09:00', endTime: '18:00' })))

function initials(name: string) {
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

async function load() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/doctor-panel/availability' } })
		return
	}
	isLoading.value = true
	loadError.value = ''
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/doctor-panel/availability' } })
		return
	}
	if (user.value.role !== 'DOCTOR') {
		router.push('/')
		return
	}

	doctor.value = await fetchMyProfile()
	if (!doctor.value) {
		loadError.value = "Sizning hisobingizga hech qanday shifokor profili biriktirilmagan"
		isLoading.value = false
		return
	}

	const slots = await fetchMyAvailability()
	if (slots.length) {
		slotMinutes.value = slots[0].slotMinutes
		days.value = days.value.map((d, dayOfWeek) => {
			const match = slots.find((s) => s.dayOfWeek === dayOfWeek)
			return match ? { enabled: true, startTime: match.startTime, endTime: match.endTime } : d
		})
	}
	isLoading.value = false
}

async function save() {
	saveError.value = ''
	savedAt.value = null
	const enabledDays = days.value.map((d, dayOfWeek) => ({ ...d, dayOfWeek })).filter((d) => d.enabled)
	if (!enabledDays.length) {
		saveError.value = "Kamida bitta ish kunini tanlang"
		return
	}
	for (const d of enabledDays) {
		if (d.startTime >= d.endTime) {
			saveError.value = `${DAY_LABELS[d.dayOfWeek]}: boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak`
			return
		}
	}
	isSaving.value = true
	const res = await setMyAvailability(
		enabledDays.map((d) => ({ dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime, slotMinutes: slotMinutes.value })),
	)
	isSaving.value = false
	if (!res.success) {
		saveError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	savedAt.value = Date.now()
}

onMounted(load)
onActivated(load)
</script>

<template>
	<main v-if="isLoading" class="min-h-screen flex items-center justify-center text-sm text-ink-mute">Yuklanmoqda…</main>
	<main v-else-if="user" class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-screen">
		<!-- sidebar -->
		<aside class="border-b lg:border-b-0 lg:border-r border-line-soft bg-surface p-6">
			<NuxtLink to="/" class="flex items-center gap-4 px-2">
				<div class="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="width:54px;height:54px;background: linear-gradient(135deg,#0EA5E9,#0284C7)">{{ initials(user.name || 'Dr') }}</div>
				<div><div class="text-base font-extrabold">{{ user.name || 'Shifokor' }}</div><div class="text-xs text-ink-mute mt-0.5">{{ user.phone }}</div></div>
			</NuxtLink>
			<nav class="flex flex-col gap-1 mt-7">
				<NuxtLink
					v-for="item in navItems" :key="item.label" :to="item.to"
					class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink-soft hover:bg-card"
					active-class="!font-bold !text-main !bg-brand-sky-light"
					exact-active-class="!font-bold !text-main !bg-brand-sky-light"
				>
					<UIcon :name="item.icon" class="text-lg" />{{ item.label }}
				</NuxtLink>
			</nav>
		</aside>

		<!-- content -->
		<section class="p-6 md:p-10 max-w-2xl">
			<div v-if="loadError" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute">{{ loadError }}</div>

			<template v-else-if="doctor">
				<h1 class="text-2xl font-extrabold tracking-tight">Ish vaqti</h1>
				<p class="text-sm text-ink-mute mt-1">Haftalik qabul jadvalingizni belgilang. Saqlash butun jadvalni yangi qiymatlar bilan almashtiradi.</p>

				<div class="mt-6">
					<label class="block text-xs font-bold text-ink-soft mb-2">Bitta qabul davomiyligi</label>
					<select v-model.number="slotMinutes" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
						<option v-for="m in SLOT_OPTIONS" :key="m" :value="m">{{ m }} daqiqa</option>
					</select>
				</div>

				<div class="flex flex-col gap-3 mt-6">
					<div v-for="(d, i) in days" :key="i" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
						<label class="flex items-center gap-3 w-40 shrink-0 cursor-pointer">
							<input v-model="d.enabled" type="checkbox" class="w-5 h-5 accent-current text-main" />
							<span class="text-sm font-bold" :class="d.enabled ? 'text-ink' : 'text-ink-mute'">{{ DAY_LABELS[i] }}</span>
						</label>
						<div class="flex items-center gap-2 flex-1" :class="{ 'opacity-40 pointer-events-none': !d.enabled }">
							<input v-model="d.startTime" type="time" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-surface" />
							<span class="text-ink-mute text-sm">—</span>
							<input v-model="d.endTime" type="time" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-surface" />
						</div>
					</div>
				</div>

				<p v-if="saveError" class="text-xs font-semibold text-red-600 mt-4">{{ saveError }}</p>
				<p v-if="savedAt" class="text-xs font-semibold text-brand-emerald-text mt-4">Saqlandi ✓</p>

				<button type="button" :disabled="isSaving" class="w-full sm:w-auto border-0 cursor-pointer font-bold text-sm text-white bg-main px-8 py-4 rounded-2xl mt-6 shadow-lg disabled:opacity-60" @click="save">
					{{ isSaving ? 'Saqlanmoqda…' : 'Jadvalni saqlash' }}
				</button>
			</template>
		</section>
	</main>
</template>
