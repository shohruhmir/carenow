<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminUserRow } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchUsers, updateUser, removeUser } = useSuperAdminApi()

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

const ROLE_STYLE: Record<AdminUserRow['role'], { label: string; fg: string; bg: string }> = {
	PATIENT: { label: 'Bemor', fg: '#0369A1', bg: '#E0F2FE' },
	CLINIC_ADMIN: { label: 'Klinika admin', fg: '#047857', bg: '#D1FAE5' },
	DOCTOR: { label: 'Shifokor', fg: '#B45309', bg: '#FEF3C7' },
	SUPER_ADMIN: { label: 'Platforma admin', fg: '#7C3AED', bg: '#EDE9FE' },
}

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

function initials(name: string | null) {
	if (!name) return '?'
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
	const d = new Date(iso)
	return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

const user = ref<AuthUser | null>(null)
const users = ref<AdminUserRow[]>([])
const isLoading = ref(true)
const roleFilter = ref<'ALL' | AdminUserRow['role']>('ALL')

const filteredUsers = computed(() => (roleFilter.value === 'ALL' ? users.value : users.value.filter((u) => u.role === roleFilter.value)))

const editingId = ref<string | null>(null)
const nameInput = ref('')
const isSaving = ref(false)
const editError = ref('')
const editErrorId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')
const deleteErrorId = ref<string | null>(null)

async function loadUsers() {
	users.value = await fetchUsers()
}

function openEditForm(u: AdminUserRow) {
	editingId.value = u.id
	nameInput.value = u.name || ''
	editError.value = ''
	editErrorId.value = null
}

function cancelEdit() {
	editingId.value = null
	editError.value = ''
	editErrorId.value = null
}

async function submitEdit(id: string) {
	if (!nameInput.value.trim()) {
		editError.value = "Ism bo'sh bo'lmasligi kerak"
		editErrorId.value = id
		return
	}
	isSaving.value = true
	const res = await updateUser(id, { name: nameInput.value.trim() })
	isSaving.value = false
	if (!res.success) {
		editError.value = res.message || 'Xatolik yuz berdi'
		editErrorId.value = id
		return
	}
	editingId.value = null
	editError.value = ''
	editErrorId.value = null
	await loadUsers()
}

async function confirmDelete(id: string) {
	deleteError.value = ''
	deleteErrorId.value = null
	if (deletingId.value !== id) {
		deletingId.value = id
		return
	}
	isSaving.value = true
	const res = await removeUser(id)
	isSaving.value = false
	deletingId.value = null
	if (!res.success) {
		deleteError.value = res.message || 'Xatolik yuz berdi'
		deleteErrorId.value = id
		return
	}
	await loadUsers()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/users' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/users' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	users.value = await fetchUsers()
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
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h1 class="text-2xl font-extrabold tracking-tight">Foydalanuvchilar</h1>
					<p class="text-sm text-ink-mute mt-1">Platformadagi barcha ro'yxatdan o'tgan hisoblar.</p>
				</div>
				<select v-model="roleFilter" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
					<option value="ALL">Barcha rollar</option>
					<option value="PATIENT">Bemor</option>
					<option value="CLINIC_ADMIN">Klinika admin</option>
					<option value="DOCTOR">Shifokor</option>
					<option value="SUPER_ADMIN">Platforma admin</option>
				</select>
			</div>

			<div v-if="!filteredUsers.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Foydalanuvchi topilmadi</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="u in filteredUsers" :key="u.id">
					<!-- edit form -->
					<div v-if="editingId === u.id" class="bg-surface border border-line-soft rounded-2xl p-5">
						<input v-model="nameInput" type="text" placeholder="Ism" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card w-full sm:w-auto" />
						<p v-if="editErrorId === u.id" class="text-xs font-semibold text-red-600 mt-3">{{ editError }}</p>
						<div class="flex gap-2 mt-4">
							<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitEdit(u.id)">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
							<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelEdit">Bekor qilish</button>
						</div>
					</div>

					<!-- row -->
					<div v-else class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
						<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ initials(u.name || u.phone) }}</div>
						<div class="flex-1 text-center sm:text-left min-w-0">
							<div class="text-sm font-bold">{{ u.name || "Ism kiritilmagan" }} · {{ u.phone }}</div>
							<div class="text-xs text-ink-mute mt-0.5">Ro'yxatdan o'tgan: {{ formatDate(u.createdAt) }}</div>
							<p v-if="deleteErrorId === u.id" class="text-xs font-semibold text-red-600 mt-1">{{ deleteError }}</p>
						</div>
						<span class="text-xs font-bold px-3 py-1 rounded-lg shrink-0" :style="{ color: ROLE_STYLE[u.role].fg, background: ROLE_STYLE[u.role].bg }">{{ ROLE_STYLE[u.role].label }}</span>
						<div v-if="u.id !== user.id" class="flex items-center gap-2 shrink-0">
							<button type="button" class="text-xs font-bold text-ink-soft bg-surface border border-line px-3 py-2.5 rounded-xl cursor-pointer" @click="openEditForm(u)">Tahrirlash</button>
							<button
								type="button" :disabled="isSaving"
								class="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer disabled:opacity-60"
								:class="deletingId === u.id ? 'text-white bg-red-600' : 'text-red-700 bg-red-50'"
								@click="confirmDelete(u.id)"
							>{{ deletingId === u.id ? "Ishonchingiz komilmi?" : "O'chirish" }}</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</template>
