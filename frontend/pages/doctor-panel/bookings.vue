<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { PortalBooking } from '~/composables/useDoctorPortalApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchMyBookings } = useDoctorPortalApi()

const navItems = [
	{ icon: 'tabler:user', label: 'Profil', to: '/doctor-panel' },
	{ icon: 'tabler:clock', label: 'Ish vaqti', to: '/doctor-panel/availability' },
	{ icon: 'tabler:calendar-event', label: 'Bronlar', to: '/doctor-panel/bookings' },
]

const STATUS_STYLE: Record<PortalBooking['status'], { label: string; fg: string; bg: string }> = {
	PENDING: { label: 'Kutilmoqda', fg: '#B45309', bg: '#FEF3C7' },
	CONFIRMED: { label: 'Tasdiqlangan', fg: '#047857', bg: '#D1FAE5' },
	COMPLETED: { label: 'Yakunlangan', fg: '#047857', bg: '#D1FAE5' },
	CANCELLED: { label: 'Bekor qilingan', fg: '#B91C1C', bg: '#FEE2E2' },
}

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

const user = ref<AuthUser | null>(null)
const bookings = ref<PortalBooking[]>([])
const isLoading = ref(true)

function initials(name: string | null) {
	if (!name) return '?'
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
	const d = new Date(iso)
	return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

async function load() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/doctor-panel/bookings' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/doctor-panel/bookings' } })
		return
	}
	if (user.value.role !== 'DOCTOR') {
		router.push('/')
		return
	}
	bookings.value = await fetchMyBookings()
	isLoading.value = false
}

function handleLogout() {
	logout()
	router.push('/')
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
			<button type="button" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-700 mt-6 cursor-pointer w-full text-left" @click="handleLogout">
				<UIcon name="tabler:logout" class="text-lg" />Chiqish
			</button>
		</aside>

		<!-- content -->
		<section class="p-6 md:p-10">
			<h1 class="text-2xl font-extrabold tracking-tight">Bronlar</h1>
			<p class="text-sm text-ink-mute mt-1">Sizga tushgan barcha bronlar ro'yxati.</p>

			<div v-if="!bookings.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Hozircha bron yo'q</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="b in bookings" :key="b.id" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
					<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ initials(b.patient.name || b.patient.phone) }}</div>
					<div class="flex-1 text-center sm:text-left min-w-0">
						<div class="text-sm font-bold">{{ b.patient.name || "Ism kiritilmagan" }} · {{ b.patient.phone }}</div>
						<div class="text-xs text-ink-mute mt-0.5">{{ formatDate(b.date) }}, {{ b.time }}</div>
					</div>
					<span class="text-xs font-bold px-3 py-1 rounded-lg shrink-0" :style="{ color: STATUS_STYLE[b.status].fg, background: STATUS_STYLE[b.status].bg }">{{ STATUS_STYLE[b.status].label }}</span>
				</div>
			</div>
		</section>
	</main>
</template>
