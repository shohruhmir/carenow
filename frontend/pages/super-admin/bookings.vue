<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminBookingRow, AdminBookingStatus } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchBookings, updateBookingStatus } = useSuperAdminApi()

const navItems = [
	{ icon: 'tabler:layout-dashboard', label: 'Umumiy', to: '/super-admin' },
	{ icon: 'tabler:building-hospital', label: 'Klinikalar', to: '/super-admin/clinics' },
	{ icon: 'tabler:medical-cross', label: 'Xizmatlar', to: '/super-admin/services' },
	{ icon: 'tabler:stethoscope', label: 'Shifokorlar', to: '/super-admin/doctors' },
	{ icon: 'tabler:briefcase', label: "So'rovlar", to: '/super-admin/leads' },
	{ icon: 'tabler:calendar-event', label: 'Bronlar', to: '/super-admin/bookings' },
	{ icon: 'tabler:users', label: 'Foydalanuvchilar', to: '/super-admin/users' },
	{ icon: 'tabler:file-text', label: 'Kontent', to: '/super-admin/content' },
]

const STATUS_STYLE: Record<AdminBookingStatus, { label: string; fg: string; bg: string }> = {
	PENDING: { label: 'Kutilmoqda', fg: '#B45309', bg: '#FEF3C7' },
	CONFIRMED: { label: 'Tasdiqlangan', fg: '#047857', bg: '#D1FAE5' },
	CANCELLED: { label: 'Bekor qilingan', fg: '#B91C1C', bg: '#FEE2E2' },
	COMPLETED: { label: 'Yakunlangan', fg: '#0369A1', bg: '#E0F2FE' },
}
const STATUS_OPTIONS: AdminBookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

function initials(name: string | null) {
	if (!name) return '?'
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
	const d = new Date(iso)
	return d.toLocaleDateString('ru-RU')
}

const user = ref<AuthUser | null>(null)
const bookings = ref<AdminBookingRow[]>([])
const isLoading = ref(true)
const statusFilter = ref<'ALL' | AdminBookingStatus>('ALL')
const savingId = ref<string | null>(null)
const errorId = ref<string | null>(null)
const errorMessage = ref('')

const filteredBookings = computed(() =>
	statusFilter.value === 'ALL' ? bookings.value : bookings.value.filter((b) => b.status === statusFilter.value),
)

async function loadBookings() {
	bookings.value = await fetchBookings()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/bookings' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/bookings' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	await loadBookings()
	isLoading.value = false
}

async function changeStatus(id: string, status: AdminBookingStatus) {
	errorId.value = null
	errorMessage.value = ''
	savingId.value = id
	const res = await updateBookingStatus(id, status)
	savingId.value = null
	if (!res.success) {
		errorId.value = id
		errorMessage.value = res.message || 'Xatolik yuz berdi'
		return
	}
	await loadBookings()
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
				<div class="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="width:54px;height:54px;background: linear-gradient(135deg,#7C3AED,#4C1D95)">{{ initials(user.name || 'Admin') }}</div>
				<div><div class="text-base font-extrabold">{{ user.name || 'Platforma admin' }}</div><div class="text-xs text-ink-mute mt-0.5">{{ user.phone }}</div></div>
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
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h1 class="text-2xl font-extrabold tracking-tight">Bronlar</h1>
					<p class="text-sm text-ink-mute mt-1">Platformadagi so'nggi 200 ta bron (oxirgi sanadan boshlab).</p>
				</div>
				<select v-model="statusFilter" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
					<option value="ALL">Barcha holatlar</option>
					<option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_STYLE[s].label }}</option>
				</select>
			</div>

			<div v-if="!filteredBookings.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Bron topilmadi</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="b in filteredBookings" :key="b.id" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
					<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#EDE9FE); color: #4338CA">{{ initials(b.patient.name || b.patient.phone) }}</div>
					<div class="flex-1 text-center sm:text-left min-w-0">
						<div class="text-sm font-bold">{{ b.patient.name || b.patient.phone }} → {{ b.doctor.name }}</div>
						<div class="text-xs text-ink-mute mt-0.5">{{ b.doctor.clinic.name }} · {{ formatDate(b.date) }} {{ b.time }}</div>
						<p v-if="errorId === b.id" class="text-xs font-semibold text-red-600 mt-1">{{ errorMessage }}</p>
					</div>
					<span class="text-xs font-bold px-3 py-1 rounded-lg shrink-0" :style="{ color: STATUS_STYLE[b.status].fg, background: STATUS_STYLE[b.status].bg }">{{ STATUS_STYLE[b.status].label }}</span>
					<select
						:value="b.status" :disabled="savingId === b.id"
						class="border border-line rounded-xl px-3 py-2.5 text-sm bg-surface shrink-0 disabled:opacity-60"
						@change="changeStatus(b.id, ($event.target as HTMLSelectElement).value as AdminBookingStatus)"
					>
						<option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_STYLE[s].label }}</option>
					</select>
				</div>
			</div>
		</section>
	</main>
</template>
