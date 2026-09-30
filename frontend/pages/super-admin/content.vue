<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminContentRow } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchContent, updateContent } = useSuperAdminApi()

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

const PAGE_LABELS: Record<string, string> = {
	home: 'Bosh sahifa',
	business: 'Biznes',
	login: 'Kirish sahifasi',
	footer: 'Footer',
	legal: 'Huquqiy sahifalar',
}
function pagePrefix(key: string) {
	return key.split('.')[0]
}
function pageLabel(prefix: string) {
	return PAGE_LABELS[prefix] || prefix
}

const user = ref<AuthUser | null>(null)
const rows = ref<AdminContentRow[]>([])
const isLoading = ref(true)
const pageFilter = ref('ALL')

const pageOptions = computed(() => {
	const prefixes = [...new Set(rows.value.map((r) => pagePrefix(r.key)))]
	return prefixes.sort()
})
const filteredRows = computed(() => (pageFilter.value === 'ALL' ? rows.value : rows.value.filter((r) => pagePrefix(r.key) === pageFilter.value)))

const editingId = ref<string | null>(null)
const form = ref({ uz: '', ru: '', en: '' })
const isSaving = ref(false)
const editError = ref('')
const editErrorId = ref<string | null>(null)

async function loadContent() {
	rows.value = await fetchContent()
}

function openEditForm(row: AdminContentRow) {
	editingId.value = row.id
	form.value = { uz: row.uz, ru: row.ru, en: row.en }
	editError.value = ''
	editErrorId.value = null
}

function cancelEdit() {
	editingId.value = null
	editError.value = ''
	editErrorId.value = null
}

async function submitEdit(id: string) {
	if (!form.value.uz.trim()) {
		editError.value = "O'zbekcha matn bo'sh bo'lmasligi kerak"
		editErrorId.value = id
		return
	}
	isSaving.value = true
	const res = await updateContent(id, form.value)
	isSaving.value = false
	if (!res.success) {
		editError.value = res.message || 'Xatolik yuz berdi'
		editErrorId.value = id
		return
	}
	editingId.value = null
	editError.value = ''
	editErrorId.value = null
	await loadContent()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/content' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/content' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	await loadContent()
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
					<h1 class="text-2xl font-extrabold tracking-tight">Kontent</h1>
					<p class="text-sm text-ink-mute mt-1">Saytdagi marketing matnlarini uch tilda (uz/ru/en) tahrirlang.</p>
				</div>
				<select v-model="pageFilter" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
					<option value="ALL">Barcha sahifalar</option>
					<option v-for="p in pageOptions" :key="p" :value="p">{{ pageLabel(p) }}</option>
				</select>
			</div>

			<div v-if="!filteredRows.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Kontent topilmadi</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="row in filteredRows" :key="row.id">
					<!-- edit form -->
					<div v-if="editingId === row.id" class="bg-surface border border-line-soft rounded-2xl p-5">
						<div class="text-sm font-bold">{{ row.label }}</div>
						<div class="text-xs text-ink-mute mt-0.5 font-mono">{{ row.key }}</div>
						<div class="grid grid-cols-1 gap-3 mt-4">
							<div>
								<label class="block text-xs font-bold text-ink-soft mb-1.5">O'zbekcha</label>
								<textarea v-model="form.uz" rows="2" class="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							</div>
							<div>
								<label class="block text-xs font-bold text-ink-soft mb-1.5">Ruscha</label>
								<textarea v-model="form.ru" rows="2" class="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							</div>
							<div>
								<label class="block text-xs font-bold text-ink-soft mb-1.5">Inglizcha</label>
								<textarea v-model="form.en" rows="2" class="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							</div>
						</div>
						<p v-if="editErrorId === row.id" class="text-xs font-semibold text-red-600 mt-3">{{ editError }}</p>
						<div class="flex gap-2 mt-4">
							<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitEdit(row.id)">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
							<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelEdit">Bekor qilish</button>
						</div>
					</div>

					<!-- row -->
					<div v-else class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-sky-light text-main shrink-0">{{ pageLabel(pagePrefix(row.key)) }}</span>
								<div class="text-sm font-bold truncate">{{ row.label }}</div>
							</div>
							<div class="text-xs text-ink-mute mt-1 font-mono">{{ row.key }}</div>
							<div class="text-xs text-ink-soft mt-1.5 line-clamp-2">{{ row.uz }}</div>
						</div>
						<button type="button" class="text-xs font-bold text-ink-soft bg-surface border border-line px-3 py-2.5 rounded-xl cursor-pointer shrink-0" @click="openEditForm(row)">Tahrirlash</button>
					</div>
				</div>
			</div>
		</section>
	</main>
</template>
