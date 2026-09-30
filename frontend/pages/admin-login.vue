<script lang="ts" setup>
const { adminLogin } = useAuth()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function submit() {
	errorMessage.value = ''
	if (!username.value.trim() || !password.value) {
		errorMessage.value = "Login va parolni kiriting"
		return
	}
	isLoading.value = true
	const res = await adminLogin(username.value.trim(), password.value)
	isLoading.value = false
	if (!res.success) {
		errorMessage.value = "Login yoki parol noto'g'ri"
		return
	}
	router.push((route.query.redirect as string) || '/super-admin')
}
</script>

<template>
	<main class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
		<div class="hidden lg:flex flex-col justify-between p-16 text-white" style="background: linear-gradient(160deg,#4C1D95,#6D28D9 55%,#7C3AED)">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center" style="background: rgba(255,255,255,.18)">
					<UIcon name="tabler:shield-lock" class="text-xl" />
				</div>
				<span class="text-xl font-extrabold">Care<span class="opacity-80">Now</span> Admin</span>
			</div>
			<div>
				<h2 class="text-4xl font-extrabold tracking-tight leading-tight">Platforma boshqaruv paneli</h2>
				<p class="mt-4 text-base opacity-85 leading-relaxed max-w-md">Klinikalar, shifokorlar va foydalanuvchilarni boshqarish uchun ichki panel. Faqat platforma xodimlari uchun.</p>
			</div>
			<div class="text-xs opacity-70">CareNow Platform</div>
		</div>

		<div class="flex items-center justify-center p-8 md:p-16">
			<div class="w-full max-w-[380px]">
				<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">Admin panel</h2>
				<p class="mt-2.5 text-sm text-ink-mute leading-relaxed">Login va parolingizni kiriting.</p>

				<label class="block text-xs font-bold text-ink-soft mt-7 mb-2">Login</label>
				<input
					v-model="username" type="text" autocomplete="username" placeholder="admin"
					class="w-full border-2 border-line rounded-2xl px-4 py-3.5 outline-none text-base font-semibold focus:border-main"
					@keyup.enter="submit"
				/>

				<label class="block text-xs font-bold text-ink-soft mt-4 mb-2">Parol</label>
				<input
					v-model="password" type="password" autocomplete="current-password" placeholder="••••••••"
					class="w-full border-2 border-line rounded-2xl px-4 py-3.5 outline-none text-base font-semibold focus:border-main"
					@keyup.enter="submit"
				/>

				<p v-if="errorMessage" class="text-xs font-semibold text-red-600 mt-3">{{ errorMessage }}</p>

				<button type="button" :disabled="isLoading" class="w-full border-0 cursor-pointer font-bold text-base text-white py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60" style="background: linear-gradient(135deg,#6D28D9,#4C1D95)" @click="submit">
					{{ isLoading ? 'Tekshirilmoqda…' : 'Kirish' }}
				</button>
			</div>
		</div>
	</main>
</template>
