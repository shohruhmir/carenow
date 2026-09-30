<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminClinicRow, AdminDoctorRow } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchClinics, fetchDoctors, createDoctor, updateDoctor, removeDoctor } = useSuperAdminApi()

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
const clinics = ref<AdminClinicRow[]>([])
const doctors = ref<AdminDoctorRow[]>([])
const isLoading = ref(true)

const showAddForm = ref(false)
const editingId = ref<string | null>(null)
const isSaving = ref(false)
const formError = ref('')
const deletingId = ref<string | null>(null)

const emptyForm = () => ({ clinicId: '', branchId: '', name: '', specialty: '', experienceYrs: '' })
const form = ref(emptyForm())

const branchesForForm = computed(() => clinics.value.find((c) => c.id === form.value.clinicId)?.branches ?? [])

watch(() => form.value.clinicId, (clinicId, prev) => {
	if (clinicId === prev) return
	if (!branchesForForm.value.some((b) => b.id === form.value.branchId)) {
		form.value.branchId = branchesForForm.value[0]?.id ?? ''
	}
})

async function loadDoctors() {
	doctors.value = await fetchDoctors()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/doctors' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/doctors' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	clinics.value = await fetchClinics()
	await loadDoctors()
	isLoading.value = false
}

function openAddForm() {
	editingId.value = null
	form.value = emptyForm()
	if (clinics.value.length) {
		form.value.clinicId = clinics.value[0].id
		form.value.branchId = clinics.value[0].branches[0]?.id ?? ''
	}
	formError.value = ''
	showAddForm.value = true
}

function openEditForm(d: AdminDoctorRow) {
	showAddForm.value = false
	editingId.value = d.id
	formError.value = ''
	form.value = { clinicId: d.clinicId, branchId: d.branchId, name: d.name, specialty: d.specialty, experienceYrs: String(d.experienceYrs) }
}

function cancelForm() {
	showAddForm.value = false
	editingId.value = null
	formError.value = ''
}

async function submitForm() {
	formError.value = ''
	if (!form.value.clinicId || !form.value.branchId || !form.value.name.trim() || !form.value.specialty.trim() || form.value.experienceYrs === '') {
		formError.value = "Barcha maydonlarni to'ldiring"
		return
	}
	const experienceYrs = Number(form.value.experienceYrs)
	if (!Number.isInteger(experienceYrs) || experienceYrs < 0) {
		formError.value = "Tajriba butun musbat son bo'lishi kerak"
		return
	}
	isSaving.value = true
	const payload = { clinicId: form.value.clinicId, branchId: form.value.branchId, name: form.value.name.trim(), specialty: form.value.specialty.trim(), experienceYrs }
	const res = editingId.value ? await updateDoctor(editingId.value, payload) : await createDoctor(payload)
	isSaving.value = false
	if (!res.success) {
		formError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	showAddForm.value = false
	editingId.value = null
	await loadDoctors()
}

async function confirmDelete(id: string) {
	if (deletingId.value !== id) {
		deletingId.value = id
		return
	}
	isSaving.value = true
	await removeDoctor(id)
	isSaving.value = false
	deletingId.value = null
	await loadDoctors()
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
					<h1 class="text-2xl font-extrabold tracking-tight">Shifokorlar</h1>
					<p class="text-sm text-ink-mute mt-1">Platformadagi barcha klinikalar shifokorlari.</p>
				</div>
				<button v-if="!showAddForm" type="button" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5" @click="openAddForm">
					<UIcon name="tabler:plus" class="text-sm" />Shifokor qo'shish
				</button>
			</div>

			<!-- add form -->
			<div v-if="showAddForm && !editingId" class="bg-surface border border-line-soft rounded-2xl p-5 mt-5">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<select v-model="form.clinicId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
						<option v-for="c in clinics" :key="c.id" :value="c.id">{{ c.name }}</option>
					</select>
					<select v-model="form.branchId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
						<option v-for="b in branchesForForm" :key="b.id" :value="b.id">{{ b.name }}</option>
					</select>
					<input v-model="form.name" type="text" placeholder="Shifokor ismi" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
					<input v-model="form.specialty" type="text" placeholder="Mutaxassislik (masalan: Ortodont)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
					<input v-model="form.experienceYrs" type="number" min="0" placeholder="Tajriba (yil)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
				</div>
				<p v-if="formError" class="text-xs font-semibold text-red-600 mt-3">{{ formError }}</p>
				<div class="flex gap-2 mt-4">
					<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitForm">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
					<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelForm">Bekor qilish</button>
				</div>
			</div>

			<div v-if="!doctors.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute mt-6">Hozircha shifokor qo'shilmagan</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="d in doctors" :key="d.id">
					<!-- edit form -->
					<div v-if="editingId === d.id" class="bg-surface border border-line-soft rounded-2xl p-5">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<select v-model="form.clinicId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
								<option v-for="c in clinics" :key="c.id" :value="c.id">{{ c.name }}</option>
							</select>
							<select v-model="form.branchId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
								<option v-for="b in branchesForForm" :key="b.id" :value="b.id">{{ b.name }}</option>
							</select>
							<input v-model="form.name" type="text" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="form.specialty" type="text" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="form.experienceYrs" type="number" min="0" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
						</div>
						<p v-if="formError" class="text-xs font-semibold text-red-600 mt-3">{{ formError }}</p>
						<div class="flex gap-2 mt-4">
							<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitForm">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
							<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelForm">Bekor qilish</button>
						</div>
					</div>

					<!-- row -->
					<div v-else class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
						<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#DBEAFE,#EDE9FE); color: #3730A3">{{ initials(d.name) }}</div>
						<div class="flex-1 text-center sm:text-left min-w-0">
							<div class="text-sm font-bold">{{ d.name }}</div>
							<div class="text-xs text-ink-mute mt-0.5">{{ d.specialty }} · {{ d.experienceYrs }} yil tajriba · {{ d.clinic.name }} ({{ d.branch.name }})</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button type="button" class="text-xs font-bold text-ink-soft bg-surface border border-line px-3 py-2.5 rounded-xl cursor-pointer" @click="openEditForm(d)">Tahrirlash</button>
							<button
								type="button" :disabled="isSaving"
								class="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer disabled:opacity-60"
								:class="deletingId === d.id ? 'text-white bg-red-600' : 'text-red-700 bg-red-50'"
								@click="confirmDelete(d.id)"
							>{{ deletingId === d.id ? "Ishonchingiz komilmi?" : "O'chirish" }}</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</template>
