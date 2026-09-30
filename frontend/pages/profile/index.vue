<script lang="ts" setup>
import type { ApiBooking } from '~/composables/useBookingApi'
import type { AuthUser } from '~/composables/useAuth'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchMyBookings, cancelBooking } = useBookingApi()

const navItems = [
	{ icon: 'tabler:calendar-event', label: 'Yozuvlarim', to: '/profile' },
	{ icon: 'tabler:heart', label: 'Sevimli shifokorlar', to: '/profile/favorites' },
	{ icon: 'tabler:settings', label: 'Sozlamalar', to: '/profile/settings' },
]

const STATUS_STYLE: Record<ApiBooking['status'], { label: string; fg: string; bg: string }> = {
	PENDING: { label: 'Kutilmoqda', fg: '#B45309', bg: '#FEF3C7' },
	CONFIRMED: { label: 'Tasdiqlangan', fg: '#047857', bg: '#D1FAE5' },
	COMPLETED: { label: 'Yakunlangan', fg: '#047857', bg: '#D1FAE5' },
	CANCELLED: { label: 'Bekor qilingan', fg: '#B91C1C', bg: '#FEE2E2' },
}

const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek']
const UZ_DOW = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']

function initials(name: string | null, phone: string | null) {
	if (name) return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
	return phone ? phone.slice(-2) : '?'
}

const user = ref<AuthUser | null>(null)
const bookings = ref<ApiBooking[]>([])
const isLoading = ref(true)
const cancellingId = ref<string | null>(null)

const today = new Date()
today.setHours(0, 0, 0, 0)

const upcoming = computed(() =>
	bookings.value
		.filter((b) => (b.status === 'PENDING' || b.status === 'CONFIRMED') && new Date(b.date) >= today)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null,
)
const otherBookings = computed(() => bookings.value.filter((b) => b.id !== upcoming.value?.id))

function dateParts(iso: string) {
	const d = new Date(iso)
	return { dow: UZ_DOW[d.getDay()], n: d.getDate(), month: UZ_MONTHS[d.getMonth()] }
}

async function loadBookings() {
	bookings.value = await fetchMyBookings()
}

async function handleCancel(id: string) {
	cancellingId.value = id
	await cancelBooking(id)
	await loadBookings()
	cancellingId.value = null
}

function handleLogout() {
	logout()
	router.push('/')
}

async function loadProfile() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/profile' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/profile' } })
		return
	}
	await loadBookings()
	isLoading.value = false
}

// Nuxt wraps pages in <KeepAlive> — if this page was visited once while
// logged out (hits the early redirect above) and the user comes back via
// login's redirect, Vue reactivates the same cached instance instead of
// remounting it, so onMounted never fires again. onActivated does.
onMounted(loadProfile)
onActivated(loadProfile)
</script>

<template>
	<main v-if="isLoading" class="min-h-screen flex items-center justify-center text-sm text-ink-mute">Yuklanmoqda…</main>
	<main v-else-if="user" class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-screen">
		<!-- sidebar -->
		<aside class="border-b lg:border-b-0 lg:border-r border-line-soft bg-surface p-6">
			<NuxtLink to="/" class="flex items-center gap-4 px-2">
				<div class="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="width:54px;height:54px;background: linear-gradient(135deg,#0EA5E9,#0284C7)">{{ initials(user.name, user.phone) }}</div>
				<div><div class="text-base font-extrabold">{{ user.name || "Ism kiritilmagan" }}</div><div class="text-xs text-ink-mute mt-0.5">{{ user.phone }}</div></div>
			</NuxtLink>
			<nav class="flex flex-col gap-1 mt-7">
				<NuxtLink
					v-for="item in navItems" :key="item.label" :to="item.to"
					class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink-soft hover:bg-card"
					exact-active-class="!font-bold !text-main !bg-brand-sky-light"
				>
					<UIcon :name="item.icon" class="text-lg" />{{ item.label }}
				</NuxtLink>
			</nav>
			<button type="button" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-700 mt-6 cursor-pointer w-full text-left" @click="handleLogout">
				<UIcon name="tabler:logout" class="text-lg" />Chiqish
			</button>
		</aside>

		<!-- content -->
		<section class="p-6 md:p-10">
			<h1 class="text-2xl font-extrabold tracking-tight">Yozuvlarim</h1>

			<NuxtLink v-if="user.role === 'CLINIC_ADMIN'" to="/clinic-admin" class="mt-4 flex items-center justify-between gap-3 bg-brand-sky-light border border-brand-sky-border rounded-2xl px-5 py-4">
				<div class="flex items-center gap-3"><UIcon name="tabler:building-hospital" class="text-lg text-main" /><span class="text-sm font-bold text-main">Klinika paneliga o'tish</span></div>
				<UIcon name="tabler:arrow-right" class="text-main" />
			</NuxtLink>
			<NuxtLink v-if="user.role === 'DOCTOR'" to="/doctor-panel" class="mt-4 flex items-center justify-between gap-3 bg-brand-sky-light border border-brand-sky-border rounded-2xl px-5 py-4">
				<div class="flex items-center gap-3"><UIcon name="tabler:stethoscope" class="text-lg text-main" /><span class="text-sm font-bold text-main">Shifokor paneliga o'tish</span></div>
				<UIcon name="tabler:arrow-right" class="text-main" />
			</NuxtLink>
			<NuxtLink v-if="user.role === 'SUPER_ADMIN'" to="/super-admin" class="mt-4 flex items-center justify-between gap-3 bg-brand-sky-light border border-brand-sky-border rounded-2xl px-5 py-4">
				<div class="flex items-center gap-3"><UIcon name="tabler:shield-lock" class="text-lg text-main" /><span class="text-sm font-bold text-main">Platforma paneliga o'tish</span></div>
				<UIcon name="tabler:arrow-right" class="text-main" />
			</NuxtLink>

			<div v-if="upcoming" class="mt-6 rounded-3xl p-7 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl" style="background: linear-gradient(135deg,#0EA5E9,#0284C7)">
				<div class="text-center rounded-2xl px-5 py-4 shrink-0" style="background: rgba(255,255,255,.16)">
					<div class="text-xs font-bold opacity-85">{{ dateParts(upcoming.date).dow }}</div>
					<div class="text-3xl font-extrabold mt-0.5">{{ dateParts(upcoming.date).n }}</div>
					<div class="text-xs opacity-85">{{ dateParts(upcoming.date).month }}</div>
				</div>
				<div class="flex-1 text-center sm:text-left">
					<div class="text-xs font-bold tracking-wide uppercase opacity-85">Kelgusi qabul · {{ upcoming.time }}</div>
					<div class="text-xl font-extrabold mt-2">{{ upcoming.doctor.name }}</div>
					<div class="text-sm opacity-90 mt-1">{{ upcoming.doctor.clinic.name }} · {{ upcoming.doctor.branch.address }}</div>
				</div>
				<button
					type="button" :disabled="cancellingId === upcoming.id"
					class="cursor-pointer font-bold text-sm text-white px-5 py-3 rounded-xl disabled:opacity-60" style="background: rgba(255,255,255,.18)"
					@click="handleCancel(upcoming.id)"
				>{{ cancellingId === upcoming.id ? 'Bekor qilinmoqda…' : 'Bekor qilish' }}</button>
			</div>
			<div v-else class="mt-6 bg-surface border border-line-soft rounded-3xl p-8 text-center">
				<div class="text-sm text-ink-mute">Hozircha rejalashtirilgan qabul yo'q</div>
				<NuxtLink to="/doctors" class="inline-block mt-3 text-sm font-bold text-white bg-main px-6 py-3 rounded-xl">Shifokor topish</NuxtLink>
			</div>

			<div class="flex justify-between items-baseline mt-8"><div class="text-base font-extrabold">Boshqa yozuvlar</div></div>
			<div v-if="!otherBookings.length" class="text-sm text-ink-mute py-6 text-center border border-line-soft rounded-2xl mt-4">Boshqa yozuvlar yo'q</div>
			<div v-else class="flex flex-col gap-3 mt-4">
				<div v-for="b in otherBookings" :key="b.id" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
					<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ initials(b.doctor.name, '') }}</div>
					<div class="flex-1 text-center sm:text-left">
						<div class="text-sm font-bold">{{ b.doctor.name }} — {{ b.doctor.specialty }}</div>
						<div class="text-xs text-ink-mute mt-0.5">{{ dateParts(b.date).n }}-{{ dateParts(b.date).month }}, {{ b.time }} · {{ b.doctor.clinic.name }}</div>
					</div>
					<span class="text-xs font-bold px-3 py-1 rounded-lg" :style="{ color: STATUS_STYLE[b.status].fg, background: STATUS_STYLE[b.status].bg }">{{ STATUS_STYLE[b.status].label }}</span>
					<button
						v-if="b.status === 'PENDING' || b.status === 'CONFIRMED'"
						type="button" :disabled="cancellingId === b.id"
						class="text-xs font-bold text-red-700 bg-red-50 px-4 py-3 rounded-xl cursor-pointer disabled:opacity-60"
						@click="handleCancel(b.id)"
					>{{ cancellingId === b.id ? '…' : 'Bekor qilish' }}</button>
				</div>
			</div>
		</section>
	</main>
</template>
