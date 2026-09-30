<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'
import type { FavoriteRow } from '~/composables/useFavoritesApi'

const router = useRouter()
const token = useToken()
const { fetchMe, logout } = useAuth()
const { fetchMyFavorites, removeFavorite } = useFavoritesApi()

const navItems = [
	{ icon: 'tabler:calendar-event', label: 'Yozuvlarim', to: '/profile' },
	{ icon: 'tabler:heart', label: 'Sevimli shifokorlar', to: '/profile/favorites' },
	{ icon: 'tabler:settings', label: 'Sozlamalar', to: '/profile/settings' },
]

function initials(name: string | null, phone: string | null) {
	if (name) return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
	return phone ? phone.slice(-2) : '?'
}

function doctorInitials(name: string) {
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const user = ref<AuthUser | null>(null)
const favorites = ref<FavoriteRow[]>([])
const isLoading = ref(true)
const removingId = ref<string | null>(null)

async function loadFavorites() {
	favorites.value = await fetchMyFavorites()
}

async function load() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/profile/favorites' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/profile/favorites' } })
		return
	}
	await loadFavorites()
	isLoading.value = false
}

async function handleRemove(doctorId: string) {
	removingId.value = doctorId
	await removeFavorite(doctorId)
	await loadFavorites()
	removingId.value = null
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
			<h1 class="text-2xl font-extrabold tracking-tight">Sevimli shifokorlar</h1>
			<p class="text-sm text-ink-mute mt-1">Saqlab qo'ygan shifokorlaringiz ro'yxati.</p>

			<div v-if="!favorites.length" class="bg-surface border border-line-soft rounded-3xl p-8 text-center mt-6">
				<div class="text-sm text-ink-mute">Hozircha sevimli shifokor yo'q</div>
				<NuxtLink to="/doctors" class="inline-block mt-3 text-sm font-bold text-white bg-main px-6 py-3 rounded-xl">Shifokor topish</NuxtLink>
			</div>
			<div v-else class="flex flex-col gap-3 mt-6">
				<div v-for="f in favorites" :key="f.id" class="bg-card border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
					<NuxtLink :to="`/doctors/${f.doctorId}`" class="w-11.5 h-11.5 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style="width:46px;height:46px; background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ doctorInitials(f.doctor.name) }}</NuxtLink>
					<NuxtLink :to="`/doctors/${f.doctorId}`" class="flex-1 text-center sm:text-left min-w-0">
						<div class="text-sm font-bold">{{ f.doctor.name }} — {{ f.doctor.specialty }}</div>
						<div class="text-xs text-ink-mute mt-0.5">{{ f.doctor.clinic.name }} · {{ f.doctor.branch.address }}</div>
					</NuxtLink>
					<button
						type="button" :disabled="removingId === f.doctorId"
						class="text-xs font-bold text-red-700 bg-red-50 px-4 py-3 rounded-xl cursor-pointer disabled:opacity-60 shrink-0"
						@click="handleRemove(f.doctorId)"
					>{{ removingId === f.doctorId ? '…' : "Olib tashlash" }}</button>
				</div>
			</div>
		</section>
	</main>
</template>
