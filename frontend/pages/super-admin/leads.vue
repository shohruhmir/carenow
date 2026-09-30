<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminLead } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchLeads, removeLead } = useSuperAdminApi()

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

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

function initials(name: string) {
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
	const d = new Date(iso)
	return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

const user = ref<AuthUser | null>(null)
const leads = ref<AdminLead[]>([])
const isLoading = ref(true)
const deletingId = ref<string | null>(null)
const isDeleting = ref(false)

async function loadLeads() {
	leads.value = await fetchLeads()
}

async function confirmDelete(id: string) {
	if (deletingId.value !== id) {
		deletingId.value = id
		return
	}
	isDeleting.value = true
	await removeLead(id)
	isDeleting.value = false
	deletingId.value = null
	await loadLeads()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/leads' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/leads' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	await loadLeads()
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
			<h1 class="text-2xl font-extrabold tracking-tight">Biznes so'rovlari</h1>
			<p class="text-sm text-ink-mute mt-1">"Klinikangizni qo'shing" formasi orqali tushgan so'rovlar.</p>

			<div v-if="!leads.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Hozircha so'rov yo'q</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="l in leads" :key="l.id" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
					<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#FEF3C7,#FCE7F3); color: #DB2777">{{ initials(l.clinicName) }}</div>
					<div class="flex-1 text-center sm:text-left min-w-0">
						<div class="text-sm font-bold">{{ l.clinicName }} · {{ l.city }}</div>
						<div class="text-xs text-ink-mute mt-0.5">{{ l.phone }} · {{ l.branchCount }} filial · {{ formatDate(l.createdAt) }}</div>
					</div>
					<button
						type="button" :disabled="isDeleting"
						class="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer disabled:opacity-60 shrink-0"
						:class="deletingId === l.id ? 'text-white bg-red-600' : 'text-red-700 bg-red-50'"
						@click="confirmDelete(l.id)"
					>{{ deletingId === l.id ? "Ishonchingiz komilmi?" : "O'chirish" }}</button>
				</div>
			</div>
		</section>
	</main>
</template>
