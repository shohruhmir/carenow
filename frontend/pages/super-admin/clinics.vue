<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminBranchRow, AdminClinicRow } from '~/composables/useSuperAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const {
	fetchClinics,
	assignClinicOwner,
	createClinic,
	updateClinic,
	removeClinic,
	createBranch,
	updateBranch,
	removeBranch,
} = useSuperAdminApi()

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
const isLoading = ref(true)
const isSaving = ref(false)

async function loadClinics() {
	clinics.value = await fetchClinics()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/clinics' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/admin-login', query: { redirect: '/super-admin/clinics' } })
		return
	}
	if (user.value.role !== 'SUPER_ADMIN') {
		router.push('/')
		return
	}
	await loadClinics()
	isLoading.value = false
}

// --- assign/reassign owner ---
const assigningId = ref<string | null>(null)
const phoneInput = ref('')
const assignError = ref('')

function openAssignForm(clinic: AdminClinicRow) {
	assigningId.value = clinic.id
	phoneInput.value = clinic.owner?.phone ?? '+998'
	assignError.value = ''
}

function cancelAssignForm() {
	assigningId.value = null
	assignError.value = ''
}

async function submitAssignForm(clinicId: string) {
	assignError.value = ''
	if (!/^\+?\d{9,15}$/.test(phoneInput.value)) {
		assignError.value = "To'g'ri telefon raqam kiriting"
		return
	}
	isSaving.value = true
	const res = await assignClinicOwner(clinicId, phoneInput.value)
	isSaving.value = false
	if (!res.success) {
		assignError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	assigningId.value = null
	await loadClinics()
}

// --- create/edit clinic ---
const showCreateForm = ref(false)
const editingClinicId = ref<string | null>(null)
const clinicFormError = ref('')
const emptyClinicForm = () => ({ slug: '', name: '', desc: '', is247: false })
const clinicForm = ref(emptyClinicForm())

function openCreateForm() {
	editingClinicId.value = null
	assigningId.value = null
	clinicForm.value = emptyClinicForm()
	clinicFormError.value = ''
	showCreateForm.value = true
}

function openEditClinicForm(c: AdminClinicRow) {
	showCreateForm.value = false
	assigningId.value = null
	editingClinicId.value = c.id
	clinicFormError.value = ''
	clinicForm.value = { slug: c.slug, name: c.name, desc: c.desc ?? '', is247: c.is247 }
}

function cancelClinicForm() {
	showCreateForm.value = false
	editingClinicId.value = null
	clinicFormError.value = ''
}

async function submitClinicForm() {
	clinicFormError.value = ''
	if (!clinicForm.value.slug.trim() || !clinicForm.value.name.trim()) {
		clinicFormError.value = "Slug va nomni to'ldiring"
		return
	}
	if (!/^[a-z0-9-]+$/.test(clinicForm.value.slug.trim())) {
		clinicFormError.value = "Slug faqat kichik harflar, raqamlar va tire bo'lishi mumkin"
		return
	}
	isSaving.value = true
	const payload = { slug: clinicForm.value.slug.trim(), name: clinicForm.value.name.trim(), desc: clinicForm.value.desc.trim() || undefined, is247: clinicForm.value.is247 }
	const res = editingClinicId.value ? await updateClinic(editingClinicId.value, payload) : await createClinic(payload)
	isSaving.value = false
	if (!res.success) {
		clinicFormError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	showCreateForm.value = false
	editingClinicId.value = null
	await loadClinics()
}

// --- delete clinic ---
const deletingClinicId = ref<string | null>(null)
const deleteClinicError = ref('')
const deleteClinicErrorId = ref<string | null>(null)

async function confirmDeleteClinic(id: string) {
	deleteClinicError.value = ''
	deleteClinicErrorId.value = null
	if (deletingClinicId.value !== id) {
		deletingClinicId.value = id
		return
	}
	isSaving.value = true
	const res = await removeClinic(id)
	isSaving.value = false
	deletingClinicId.value = null
	if (!res.success) {
		deleteClinicError.value = res.message || 'Xatolik yuz berdi'
		deleteClinicErrorId.value = id
		return
	}
	await loadClinics()
}

// --- branches ---
const expandedClinicId = ref<string | null>(null)
const showAddBranchFor = ref<string | null>(null)
const editingBranchId = ref<string | null>(null)
const branchFormError = ref('')
const emptyBranchForm = () => ({ name: '', address: '', phone: '', lat: '', lng: '' })
const branchForm = ref(emptyBranchForm())
const deletingBranchId = ref<string | null>(null)

function toggleBranches(clinicId: string) {
	expandedClinicId.value = expandedClinicId.value === clinicId ? null : clinicId
	showAddBranchFor.value = null
	editingBranchId.value = null
}

function openAddBranchForm(clinicId: string) {
	editingBranchId.value = null
	branchForm.value = emptyBranchForm()
	branchFormError.value = ''
	showAddBranchFor.value = clinicId
}

function openEditBranchForm(b: AdminBranchRow) {
	showAddBranchFor.value = null
	editingBranchId.value = b.id
	branchFormError.value = ''
	branchForm.value = { name: b.name, address: b.address, phone: b.phone, lat: String(b.lat), lng: String(b.lng) }
}

function cancelBranchForm() {
	showAddBranchFor.value = null
	editingBranchId.value = null
	branchFormError.value = ''
}

async function submitBranchForm(clinicId: string) {
	branchFormError.value = ''
	const { name, address, phone, lat, lng } = branchForm.value
	if (!name.trim() || !address.trim() || !phone.trim() || lat === '' || lng === '') {
		branchFormError.value = "Barcha maydonlarni to'ldiring"
		return
	}
	const latNum = Number(lat)
	const lngNum = Number(lng)
	if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
		branchFormError.value = "Lat/Lng son bo'lishi kerak"
		return
	}
	isSaving.value = true
	const payload = { name: name.trim(), address: address.trim(), phone: phone.trim(), lat: latNum, lng: lngNum }
	const res = editingBranchId.value ? await updateBranch(editingBranchId.value, payload) : await createBranch(clinicId, payload)
	isSaving.value = false
	if (!res.success) {
		branchFormError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	showAddBranchFor.value = null
	editingBranchId.value = null
	await loadClinics()
}

async function confirmDeleteBranch(id: string) {
	if (deletingBranchId.value !== id) {
		deletingBranchId.value = id
		return
	}
	isSaving.value = true
	await removeBranch(id)
	isSaving.value = false
	deletingBranchId.value = null
	await loadClinics()
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
					<h1 class="text-2xl font-extrabold tracking-tight">Klinikalar</h1>
					<p class="text-sm text-ink-mute mt-1">Platformadagi barcha klinikalar, filiallar va egalari.</p>
				</div>
				<button v-if="!showCreateForm" type="button" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5" @click="openCreateForm">
					<UIcon name="tabler:plus" class="text-sm" />Yangi klinika
				</button>
			</div>

			<!-- create clinic form -->
			<div v-if="showCreateForm" class="bg-surface border border-line-soft rounded-2xl p-5 mt-5">
				<div class="text-sm font-bold mb-3">Yangi klinika</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<input v-model="clinicForm.name" type="text" placeholder="Klinika nomi" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
					<input v-model="clinicForm.slug" type="text" placeholder="slug (masalan: smile-dental)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
					<input v-model="clinicForm.desc" type="text" placeholder="Tavsif (ixtiyoriy)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card sm:col-span-2" />
					<label class="flex items-center gap-2 text-sm font-semibold text-ink-soft"><input v-model="clinicForm.is247" type="checkbox" class="w-4 h-4 accent-main" />24/7 ochiq</label>
				</div>
				<p v-if="clinicFormError" class="text-xs font-semibold text-red-600 mt-3">{{ clinicFormError }}</p>
				<div class="flex gap-2 mt-4">
					<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitClinicForm">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
					<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelClinicForm">Bekor qilish</button>
				</div>
			</div>

			<div class="flex flex-col gap-3 mt-6">
				<div v-for="c in clinics" :key="c.id">
					<!-- assign owner form -->
					<div v-if="assigningId === c.id" class="bg-surface border border-line-soft rounded-2xl p-5">
						<div class="text-sm font-bold mb-3">{{ c.name }} — egasini belgilash</div>
						<div class="flex flex-col sm:flex-row gap-3">
							<input v-model="phoneInput" type="tel" placeholder="+998901234567" class="flex-1 border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<div class="flex gap-2">
								<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitAssignForm(c.id)">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
								<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelAssignForm">Bekor qilish</button>
							</div>
						</div>
						<p v-if="assignError" class="text-xs font-semibold text-red-600 mt-3">{{ assignError }}</p>
						<p class="text-xs text-ink-mute mt-2">Agar bu raqamda foydalanuvchi mavjud bo'lmasa, yangi klinika-admin hisobi yaratiladi.</p>
					</div>

					<!-- edit clinic form -->
					<div v-else-if="editingClinicId === c.id" class="bg-surface border border-line-soft rounded-2xl p-5">
						<div class="text-sm font-bold mb-3">{{ c.name }} — tahrirlash</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<input v-model="clinicForm.name" type="text" placeholder="Klinika nomi" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="clinicForm.slug" type="text" placeholder="slug" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="clinicForm.desc" type="text" placeholder="Tavsif" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card sm:col-span-2" />
							<label class="flex items-center gap-2 text-sm font-semibold text-ink-soft"><input v-model="clinicForm.is247" type="checkbox" class="w-4 h-4 accent-main" />24/7 ochiq</label>
						</div>
						<p v-if="clinicFormError" class="text-xs font-semibold text-red-600 mt-3">{{ clinicFormError }}</p>
						<div class="flex gap-2 mt-4">
							<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitClinicForm">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
							<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelClinicForm">Bekor qilish</button>
						</div>
					</div>

					<!-- clinic row -->
					<div v-else class="bg-card border border-line rounded-2xl p-4">
						<div class="flex flex-col sm:flex-row items-center gap-4">
							<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#EDE9FE,#E0F2FE); color: #7C3AED">{{ initials(c.name) }}</div>
							<div class="flex-1 text-center sm:text-left min-w-0">
								<div class="text-sm font-bold">{{ c.name }} <span v-if="c.is247" class="text-xs font-bold text-brand-emerald-text bg-brand-emerald-light px-2 py-0.5 rounded-lg ml-1">24/7</span></div>
								<div class="text-xs text-ink-mute mt-0.5">{{ c._count.branches }} filial · {{ c._count.doctors }} shifokor · {{ c.rating.toFixed(1) }} ★</div>
								<div class="text-xs mt-1" :class="c.owner ? 'text-ink-soft' : 'text-brand-amber-text font-semibold'">
									{{ c.owner ? `Egasi: ${c.owner.name || c.owner.phone}` : 'Egasi tayinlanmagan' }}
								</div>
							</div>
							<div class="flex items-center gap-2 flex-wrap justify-center shrink-0">
								<button type="button" class="text-xs font-bold text-ink-soft bg-surface border border-line px-3 py-2.5 rounded-xl cursor-pointer" @click="toggleBranches(c.id)">
									Filiallar ({{ c._count.branches }}) {{ expandedClinicId === c.id ? '▴' : '▾' }}
								</button>
								<button type="button" class="text-xs font-bold text-main bg-brand-sky-light px-3 py-2.5 rounded-xl cursor-pointer" @click="openAssignForm(c)">
									{{ c.owner ? 'Egasini almashtirish' : 'Ega tayinlash' }}
								</button>
								<button type="button" class="text-xs font-bold text-ink-soft bg-surface border border-line px-3 py-2.5 rounded-xl cursor-pointer" @click="openEditClinicForm(c)">Tahrirlash</button>
								<button
									type="button" :disabled="isSaving"
									class="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer disabled:opacity-60"
									:class="deletingClinicId === c.id ? 'text-white bg-red-600' : 'text-red-700 bg-red-50'"
									@click="confirmDeleteClinic(c.id)"
								>{{ deletingClinicId === c.id ? "Ishonchingiz komilmi?" : "O'chirish" }}</button>
							</div>
						</div>
						<p v-if="deleteClinicErrorId === c.id" class="text-xs font-semibold text-red-600 mt-3">{{ deleteClinicError }}</p>

						<!-- branches (expanded) -->
						<div v-if="expandedClinicId === c.id" class="mt-4 pt-4 border-t border-line-soft">
							<div class="flex items-center justify-between mb-3">
								<div class="text-xs font-extrabold uppercase tracking-wide text-ink-mute">Filiallar</div>
								<button v-if="showAddBranchFor !== c.id" type="button" class="text-xs font-bold text-main bg-brand-sky-light px-3 py-2 rounded-xl cursor-pointer" @click="openAddBranchForm(c.id)">+ Filial qo'shish</button>
							</div>

							<!-- add branch form -->
							<div v-if="showAddBranchFor === c.id" class="bg-surface border border-line-soft rounded-xl p-4 mb-3">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
									<input v-model="branchForm.name" type="text" placeholder="Filial nomi" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
									<input v-model="branchForm.phone" type="text" placeholder="Telefon" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
									<input v-model="branchForm.address" type="text" placeholder="Manzil" class="border border-line rounded-lg px-3 py-2 text-sm bg-card sm:col-span-2" />
									<input v-model="branchForm.lat" type="text" placeholder="Lat (masalan: 41.31)" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
									<input v-model="branchForm.lng" type="text" placeholder="Lng (masalan: 69.28)" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
								</div>
								<p v-if="branchFormError" class="text-xs font-semibold text-red-600 mt-2">{{ branchFormError }}</p>
								<div class="flex gap-2 mt-3">
									<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-3 py-2 rounded-lg cursor-pointer disabled:opacity-60" @click="submitBranchForm(c.id)">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
									<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-3 py-2 rounded-lg cursor-pointer" @click="cancelBranchForm">Bekor qilish</button>
								</div>
							</div>

							<div v-if="!c.branches.length" class="text-xs text-ink-mute py-3 text-center">Hozircha filial yo'q</div>
							<div v-else class="flex flex-col gap-2">
								<div v-for="b in c.branches" :key="b.id">
									<!-- edit branch form -->
									<div v-if="editingBranchId === b.id" class="bg-surface border border-line-soft rounded-xl p-4">
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
											<input v-model="branchForm.name" type="text" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
											<input v-model="branchForm.phone" type="text" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
											<input v-model="branchForm.address" type="text" class="border border-line rounded-lg px-3 py-2 text-sm bg-card sm:col-span-2" />
											<input v-model="branchForm.lat" type="text" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
											<input v-model="branchForm.lng" type="text" class="border border-line rounded-lg px-3 py-2 text-sm bg-card" />
										</div>
										<p v-if="branchFormError" class="text-xs font-semibold text-red-600 mt-2">{{ branchFormError }}</p>
										<div class="flex gap-2 mt-3">
											<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-3 py-2 rounded-lg cursor-pointer disabled:opacity-60" @click="submitBranchForm(c.id)">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
											<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-3 py-2 rounded-lg cursor-pointer" @click="cancelBranchForm">Bekor qilish</button>
										</div>
									</div>

									<!-- branch row -->
									<div v-else class="bg-surface border border-line-soft rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
										<UIcon name="tabler:map-pin" class="text-main text-base shrink-0" />
										<div class="flex-1 text-center sm:text-left min-w-0">
											<div class="text-xs font-bold">{{ b.name }}</div>
											<div class="text-xs text-ink-mute mt-0.5">{{ b.address }} · {{ b.phone }}</div>
										</div>
										<div class="flex items-center gap-2 shrink-0">
											<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-2.5 py-2 rounded-lg cursor-pointer" @click="openEditBranchForm(b)">Tahrirlash</button>
											<button
												type="button" :disabled="isSaving"
												class="text-xs font-bold px-2.5 py-2 rounded-lg cursor-pointer disabled:opacity-60"
												:class="deletingBranchId === b.id ? 'text-white bg-red-600' : 'text-red-700 bg-red-50'"
												@click="confirmDeleteBranch(b.id)"
											>{{ deletingBranchId === b.id ? "Ishonchingiz komilmi?" : "O'chirish" }}</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</template>
