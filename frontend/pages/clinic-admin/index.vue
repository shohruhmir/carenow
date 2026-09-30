<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { AdminClinic, AdminDoctor } from '~/composables/useClinicAdminApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchMyClinic, addDoctor, updateDoctor, removeDoctor } = useClinicAdminApi()

const navItems = [
	{ icon: 'tabler:building-hospital', label: 'Klinika', to: '/clinic-admin' },
	{ icon: 'tabler:calendar-event', label: 'Bronlar', to: '/clinic-admin/bookings' },
]

const user = ref<AuthUser | null>(null)
const clinic = ref<AdminClinic | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const showAddForm = ref(false)
const isSaving = ref(false)
const formError = ref('')
const editingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')

const emptyForm = () => ({ branchId: '', name: '', specialty: '', experienceYrs: '' })
const form = ref(emptyForm())

function initials(name: string) {
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function branchName(branchId: string) {
	return clinic.value?.branches.find((b) => b.id === branchId)?.name ?? '—'
}

async function loadClinic() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/clinic-admin' } })
		return
	}
	isLoading.value = true
	loadError.value = ''
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/clinic-admin' } })
		return
	}
	if (user.value.role !== 'CLINIC_ADMIN') {
		router.push('/')
		return
	}
	clinic.value = await fetchMyClinic()
	if (!clinic.value) loadError.value = "Sizning hisobingizga hech qanday klinika biriktirilmagan"
	isLoading.value = false
}

function handleLogout() {
	logout()
	router.push('/')
}

function openAddForm() {
	editingId.value = null
	form.value = emptyForm()
	if (clinic.value?.branches.length) form.value.branchId = clinic.value.branches[0].id
	formError.value = ''
	showAddForm.value = true
}

function openEditForm(d: AdminDoctor) {
	showAddForm.value = false
	editingId.value = d.id
	formError.value = ''
	form.value = { branchId: d.branchId, name: d.name, specialty: d.specialty, experienceYrs: String(d.experienceYrs) }
}

function cancelForm() {
	showAddForm.value = false
	editingId.value = null
	formError.value = ''
}

async function submitForm() {
	formError.value = ''
	if (!form.value.branchId || !form.value.name.trim() || !form.value.specialty.trim() || form.value.experienceYrs === '') {
		formError.value = "Barcha maydonlarni to'ldiring"
		return
	}
	const experienceYrs = Number(form.value.experienceYrs)
	if (!Number.isInteger(experienceYrs) || experienceYrs < 0) {
		formError.value = "Tajriba (yil) butun son bo'lishi kerak"
		return
	}
	isSaving.value = true
	const payload = { branchId: form.value.branchId, name: form.value.name.trim(), specialty: form.value.specialty.trim(), experienceYrs }
	const res = editingId.value ? await updateDoctor(editingId.value, payload) : await addDoctor(payload)
	isSaving.value = false
	if (!res.success) {
		formError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	showAddForm.value = false
	editingId.value = null
	clinic.value = await fetchMyClinic()
}

async function confirmDelete(id: string) {
	deleteError.value = ''
	if (deletingId.value !== id) {
		deletingId.value = id
		return
	}
	isSaving.value = true
	const res = await removeDoctor(id)
	isSaving.value = false
	deletingId.value = null
	if (!res.success) {
		deleteError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	clinic.value = await fetchMyClinic()
}

onMounted(loadClinic)
onActivated(loadClinic)
</script>

<template>
	<main v-if="isLoading" class="min-h-screen flex items-center justify-center text-sm text-ink-mute">Yuklanmoqda…</main>
	<main v-else-if="user" class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-screen">
		<!-- sidebar -->
		<aside class="border-b lg:border-b-0 lg:border-r border-line-soft bg-surface p-6">
			<NuxtLink to="/" class="flex items-center gap-4 px-2">
				<div class="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="width:54px;height:54px;background: linear-gradient(135deg,#0EA5E9,#0284C7)">{{ initials(user.name || 'Admin') }}</div>
				<div><div class="text-base font-extrabold">{{ user.name || 'Klinika admin' }}</div><div class="text-xs text-ink-mute mt-0.5">{{ user.phone }}</div></div>
			</NuxtLink>
			<nav class="flex flex-col gap-1 mt-7">
				<NuxtLink
					v-for="item in navItems" :key="item.label" :to="item.to"
					class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink-soft hover:bg-card"
					active-class="!font-bold !text-main !bg-brand-sky-light"
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
			<div v-if="loadError" class="bg-surface border border-line-soft rounded-3xl p-8 text-center text-sm text-ink-mute">{{ loadError }}</div>

			<template v-else-if="clinic">
				<div class="flex items-start justify-between flex-wrap gap-3">
					<div>
						<h1 class="text-2xl font-extrabold tracking-tight">{{ clinic.name }}</h1>
						<p class="text-sm text-ink-mute mt-1 max-w-xl">{{ clinic.desc }}</p>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold px-3 py-2 rounded-lg bg-brand-amber-light text-brand-amber-text flex items-center gap-1"><UIcon name="tabler:star-filled" class="text-sm" />{{ clinic.rating.toFixed(1) }}</span>
						<span v-if="clinic.is247" class="text-xs font-bold px-3 py-2 rounded-lg bg-brand-emerald-light text-brand-emerald-text">24/7 ochiq</span>
					</div>
				</div>

				<!-- stats -->
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-7">
					<div class="bg-card border border-line rounded-2xl p-5">
						<div class="text-2xl font-extrabold">{{ clinic.branches.length }}</div>
						<div class="text-xs text-ink-mute font-semibold mt-1">Filial</div>
					</div>
					<div class="bg-card border border-line rounded-2xl p-5">
						<div class="text-2xl font-extrabold">{{ clinic.doctors.length }}</div>
						<div class="text-xs text-ink-mute font-semibold mt-1">Shifokor</div>
					</div>
					<NuxtLink to="/clinic-admin/bookings" class="bg-card border border-line rounded-2xl p-5 hover:border-main">
						<div class="text-2xl font-extrabold flex items-center gap-2">Bronlar <UIcon name="tabler:arrow-right" class="text-base text-ink-mute" /></div>
						<div class="text-xs text-ink-mute font-semibold mt-1">Barchasini ko'rish</div>
					</NuxtLink>
				</div>

				<!-- branches -->
				<div class="mt-9">
					<div class="text-base font-extrabold">Filiallar</div>
					<div class="flex flex-col gap-3 mt-4">
						<div v-for="b in clinic.branches" :key="b.id" class="bg-card border border-line rounded-2xl p-4 flex items-center gap-4">
							<span class="w-10 h-10 rounded-xl bg-brand-sky-light text-main flex items-center justify-center shrink-0"><UIcon name="tabler:map-pin" class="text-lg" /></span>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-bold">{{ b.name }}</div>
								<div class="text-xs text-ink-mute mt-0.5">{{ b.address }} · {{ b.phone }}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- doctors -->
				<div class="mt-9">
					<p v-if="deleteError" class="text-xs font-semibold text-red-600 mb-3">{{ deleteError }}</p>
					<div class="flex items-center justify-between">
						<div class="text-base font-extrabold">Shifokorlar</div>
						<button v-if="!showAddForm" type="button" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5" @click="openAddForm">
							<UIcon name="tabler:plus" class="text-sm" />Shifokor qo'shish
						</button>
					</div>

					<!-- add form -->
					<div v-if="showAddForm && !editingId" class="bg-surface border border-line-soft rounded-2xl p-5 mt-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<select v-model="form.branchId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
								<option v-for="b in clinic.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
							</select>
							<input v-model="form.name" type="text" placeholder="F.I.Sh. (masalan: Dr. Aziza Karimova)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="form.specialty" type="text" placeholder="Mutaxassislik (masalan: Ortodont)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
							<input v-model="form.experienceYrs" type="number" min="0" placeholder="Tajriba (yil)" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
						</div>
						<p v-if="formError" class="text-xs font-semibold text-red-600 mt-3">{{ formError }}</p>
						<div class="flex gap-2 mt-4">
							<button type="button" :disabled="isSaving" class="text-xs font-bold text-white bg-main px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-60" @click="submitForm">{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
							<button type="button" class="text-xs font-bold text-ink-soft bg-card border border-line px-4 py-2.5 rounded-xl cursor-pointer" @click="cancelForm">Bekor qilish</button>
						</div>
					</div>

					<div v-if="!clinic.doctors.length" class="text-sm text-ink-mute py-6 text-center border border-line-soft rounded-2xl mt-4">Hozircha shifokor qo'shilmagan</div>
					<div v-else class="flex flex-col gap-3 mt-4">
						<div v-for="d in clinic.doctors" :key="d.id">
							<!-- edit form -->
							<div v-if="editingId === d.id" class="bg-surface border border-line-soft rounded-2xl p-5">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<select v-model="form.branchId" class="border border-line rounded-xl px-3 py-2.5 text-sm bg-card">
										<option v-for="b in clinic.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
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
								<div class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ initials(d.name) }}</div>
								<div class="flex-1 text-center sm:text-left min-w-0">
									<div class="text-sm font-bold">{{ d.name }} — {{ d.specialty }}</div>
									<div class="text-xs text-ink-mute mt-0.5">{{ branchName(d.branchId) }} · {{ d.experienceYrs }} yil staj</div>
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<NuxtLink :to="`/clinic-admin/doctors/${d.id}/availability`" class="text-xs font-bold text-main bg-brand-sky-light px-3 py-2.5 rounded-xl">Ish vaqti</NuxtLink>
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
				</div>
			</template>
		</section>
	</main>
</template>
