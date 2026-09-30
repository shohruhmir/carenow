<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { PlatformStats } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchStats } = useSuperAdminApi()

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

function initials(name: string) {
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const user = ref<AuthUser | null>(null)
const stats = ref<PlatformStats | null>(null)
const isLoading = ref(true)

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	stats.value = await fetchStats()
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
			<h1 class="text-2xl font-extrabold tracking-tight">Platforma ko'rinishi</h1>
			<p class="text-sm text-ink-mute mt-1">CareNow bo'ylab umumiy statistika.</p>

			<div v-if="stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-7">
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.clinics }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Klinika</div>
				</div>
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.branches }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Filial</div>
				</div>
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.doctors }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Shifokor</div>
				</div>
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.patients }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Bemor</div>
				</div>
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.clinicAdmins }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Klinika admin</div>
				</div>
				<div class="bg-card border border-line rounded-2xl p-5">
					<div class="text-2xl font-extrabold">{{ stats.bookings }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Bron</div>
				</div>
				<NuxtLink to="/super-admin/leads" class="bg-card border border-line rounded-2xl p-5 hover:border-main">
					<div class="text-2xl font-extrabold">{{ stats.leads }}</div>
					<div class="text-xs text-ink-mute font-semibold mt-1">Biznes so'rovi</div>
				</NuxtLink>
			</div>
		</section>
	</main>
</template>
