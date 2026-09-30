<script lang="ts" setup>
import type { AuthUser } from '~/composables/useAuth'

const router = useRouter()
const token = useToken()
const { fetchMe, updateProfile, logout } = useAuth()

const navItems = [
	{ icon: 'tabler:calendar-event', label: 'Yozuvlarim', to: '/profile' },
	{ icon: 'tabler:heart', label: 'Sevimli shifokorlar', to: '/profile/favorites' },
	{ icon: 'tabler:settings', label: 'Sozlamalar', to: '/profile/settings' },
]

function initials(name: string | null, phone: string | null) {
	if (name) return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
	return phone ? phone.slice(-2) : '?'
}

const user = ref<AuthUser | null>(null)
const isLoading = ref(true)
const nameInput = ref('')
const isSaving = ref(false)
const saveError = ref('')
const savedAt = ref<number | null>(null)

async function load() {
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: '/profile/settings' } })
		return
	}
	isLoading.value = true
	user.value = await fetchMe()
	if (!user.value) {
		router.push({ path: '/login', query: { redirect: '/profile/settings' } })
		return
	}
	nameInput.value = user.value.name || ''
	isLoading.value = false
}

async function save() {
	saveError.value = ''
	savedAt.value = null
	if (nameInput.value.trim().length < 2) {
		saveError.value = "Ism kamida 2 ta belgidan iborat bo'lishi kerak"
		return
	}
	isSaving.value = true
	const res = await updateProfile(nameInput.value.trim())
	isSaving.value = false
	if (!res.success) {
		saveError.value = res.message || 'Xatolik yuz berdi'
		return
	}
	if (user.value) user.value.name = res.data?.name ?? nameInput.value.trim()
	savedAt.value = Date.now()
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
		<section class="p-6 md:p-10 max-w-lg">
			<h1 class="text-2xl font-extrabold tracking-tight">Sozlamalar</h1>
			<p class="text-sm text-ink-mute mt-1">Hisobingiz ma'lumotlarini boshqaring.</p>

			<div class="mt-6">
				<label class="block text-xs font-bold text-ink-soft mb-2">Telefon raqam</label>
				<div class="border border-line rounded-xl px-3 py-2.5 text-sm bg-surface text-ink-mute">{{ user.phone || "Kiritilmagan (Google orqali ro'yxatdan o'tgansiz)" }}</div>
				<p class="text-xs text-ink-mute mt-1.5">Telefon raqamni o'zgartirish hozircha mavjud emas.</p>
			</div>

			<div class="mt-5">
				<label class="block text-xs font-bold text-ink-soft mb-2">Ism</label>
				<input v-model="nameInput" type="text" placeholder="Ismingizni kiriting" class="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-card" />
			</div>

			<p v-if="saveError" class="text-xs font-semibold text-red-600 mt-3">{{ saveError }}</p>
			<p v-if="savedAt" class="text-xs font-semibold text-brand-emerald-text mt-3">Saqlandi ✓</p>

			<button type="button" :disabled="isSaving" class="border-0 cursor-pointer font-bold text-sm text-white bg-main px-8 py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60" @click="save">
				{{ isSaving ? 'Saqlanmoqda…' : 'Saqlash' }}
			</button>
		</section>
	</main>
</template>
