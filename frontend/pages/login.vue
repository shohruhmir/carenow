<script lang="ts" setup>
const { t } = useSiteContent()
const { requestOtp, verifyOtp, googleLogin } = useAuth()
const { preload: preloadGoogle, requestAccessToken, hasClientId, isReady: isGoogleReady } = useGoogleAuth()
const router = useRouter()
const route = useRoute()

const step = ref<'phone' | 'otp'>('phone')
const phone = ref('')
const code = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const devCode = ref<string | null>(null)
const isGoogleLoading = ref(false)

onMounted(() => {
	if (hasClientId) preloadGoogle()
})

function goToRoleHome(role: string) {
	const roleHome: Record<string, string> = { CLINIC_ADMIN: '/clinic-admin', DOCTOR: '/doctor-panel', SUPER_ADMIN: '/super-admin' }
	const fallback = roleHome[role] || '/profile'
	router.push((route.query.redirect as string) || fallback)
}

async function submitGoogle() {
	errorMessage.value = ''
	isGoogleLoading.value = true
	try {
		const accessToken = await requestAccessToken()
		const res = await googleLogin(accessToken)
		if (!res.success || !res.data) {
			errorMessage.value = "Google orqali kirishda xatolik yuz berdi"
			return
		}
		goToRoleHome(res.data.user.role)
	} catch {
		errorMessage.value = "Google orqali kirishda xatolik yuz berdi"
	} finally {
		isGoogleLoading.value = false
	}
}

const fullPhone = computed(() => `+998${phone.value.replace(/\s/g, '')}`)

async function submitPhone() {
	errorMessage.value = ''
	if (!/^\d{9}$/.test(phone.value.replace(/\s/g, ''))) {
		errorMessage.value = "Telefon raqamni to'liq kiriting (9 ta raqam)"
		return
	}
	isLoading.value = true
	const res = await requestOtp(fullPhone.value)
	isLoading.value = false
	if (!res.success) {
		errorMessage.value = res.message || 'Xatolik yuz berdi'
		return
	}
	devCode.value = res.data?.devCode ?? null
	step.value = 'otp'
}

async function submitCode() {
	errorMessage.value = ''
	if (!/^\d{4}$/.test(code.value)) {
		errorMessage.value = "4 xonali kodni kiriting"
		return
	}
	isLoading.value = true
	const res = await verifyOtp(fullPhone.value, code.value)
	isLoading.value = false
	if (!res.success) {
		// verifyOtp only fails for one reason (bad/expired code); the backend
		// message is in English and isn't localized, so show our own text
		// instead of surfacing res.message.
		errorMessage.value = 'Kod noto\'g\'ri yoki muddati o\'tgan'
		return
	}
	goToRoleHome(res.data?.user.role ?? '')
}

function backToPhone() {
	step.value = 'phone'
	code.value = ''
	errorMessage.value = ''
}
</script>

<template>
	<main class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
		<div class="hidden lg:flex flex-col justify-between p-16 text-white" style="background: linear-gradient(160deg,#0EA5E9,#0284C7 55%,#0E7490)">
			<NuxtLink to="/" class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center" style="background: rgba(255,255,255,.18)">
					<svg width="21" height="21" viewBox="0 0 48 48" fill="none"><path d="M24 41s-13-8-17.3-15.5C4 21 5 14.5 10 12.5c3.6-1.4 7 .5 9 3.2.6 1 1.4 1 2 0 2-2.7 5.4-4.6 9-3.2 5 2 6 8.5 3.3 13C37 33 24 41 24 41z" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" /><path d="M13 25h6l3-6 4 12 3-6h6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</div>
				<span class="text-xl font-extrabold">Care<span class="opacity-80">Now</span></span>
			</NuxtLink>
			<div>
				<h2 class="text-4xl font-extrabold tracking-tight leading-tight">{{ t('login.pitch.title', "Sog'lig'ingiz uchun bitta hisob") }}</h2>
				<div class="flex flex-col gap-4 mt-7">
					<div class="flex gap-3 items-center text-base"><span class="w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,255,255,.2); width:26px; height:26px"><UIcon name="tabler:check" class="text-xs" /></span>{{ t('login.pitch.bullet.1', 'Yozuvlaringiz va tibbiy kartangiz bir joyda') }}</div>
					<div class="flex gap-3 items-center text-base"><span class="w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,255,255,.2); width:26px; height:26px"><UIcon name="tabler:check" class="text-xs" /></span>{{ t('login.pitch.bullet.2', "Oila a'zolaringizni ham yozing") }}</div>
					<div class="flex gap-3 items-center text-base"><span class="w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,255,255,.2); width:26px; height:26px"><UIcon name="tabler:check" class="text-xs" /></span>{{ t('login.pitch.bullet.3', "CareNow chegirmalari avtomatik qo'llanadi") }}</div>
				</div>
			</div>
			<div class="text-xs opacity-70">{{ t('login.trust', "120 000+ bemor allaqachon CareNow'da") }}</div>
		</div>

		<div class="flex items-center justify-center p-8 md:p-16">
			<div class="w-full max-w-[420px]">
				<template v-if="step === 'phone'">
					<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">Xush kelibsiz 👋</h2>
					<p class="mt-2.5 text-sm text-ink-mute leading-relaxed">Telefon raqamingizni kiriting — SMS orqali tasdiqlash kodi yuboramiz.</p>
					<label class="block text-xs font-bold text-ink-soft mt-7 mb-2">Telefon raqam</label>
					<div class="flex items-center gap-3 border-2 border-brand-sky rounded-2xl px-4 py-4" style="box-shadow: 0 0 0 4px rgba(14,165,233,.1)">
						<span class="text-base font-bold text-ink-soft border-r border-line pr-3">+998</span>
						<input v-model="phone" type="tel" placeholder="90 123 45 67" class="flex-1 outline-none text-base font-semibold placeholder:text-ink-mute placeholder:font-normal" @keyup.enter="submitPhone" />
					</div>
					<p v-if="errorMessage" class="text-xs font-semibold text-red-600 mt-2">{{ errorMessage }}</p>
					<button type="button" :disabled="isLoading" class="w-full border-0 cursor-pointer font-bold text-base text-white bg-main py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60" @click="submitPhone">
						{{ isLoading ? 'Yuborilmoqda…' : 'SMS kod olish' }}
					</button>
					<template v-if="hasClientId">
						<div class="flex items-center gap-4 my-6"><div class="flex-1 h-px bg-line-soft" /><span class="text-xs text-ink-mute">yoki</span><div class="flex-1 h-px bg-line-soft" /></div>
						<button
							type="button" :disabled="isGoogleLoading || !isGoogleReady"
							class="w-full cursor-pointer font-bold text-sm text-ink bg-card border-[1.5px] border-line rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60"
							@click="submitGoogle"
						>
							<span class="w-4.5 h-4.5 rounded-full" style="width:18px;height:18px;background: conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)" />{{ isGoogleLoading ? 'Kutilmoqda…' : 'Google orqali kirish' }}
						</button>
					</template>
					<p class="mt-6 text-xs text-ink-mute leading-relaxed text-center">Davom etish orqali siz <NuxtLink to="/terms" class="text-main">Foydalanish shartlari</NuxtLink> va <NuxtLink to="/privacy" class="text-main">Maxfiylik siyosati</NuxtLink>ga rozilik bildirasiz.</p>
				</template>

				<template v-else>
					<button type="button" class="flex items-center gap-2 text-sm font-bold text-ink-soft cursor-pointer" @click="backToPhone">
						<UIcon name="tabler:chevron-left" />+998{{ phone }}
					</button>
					<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mt-4">SMS kodni kiriting</h2>
					<p class="mt-2.5 text-sm text-ink-mute leading-relaxed">+998{{ phone }} raqamiga 4 xonali kod yuborildi.</p>
					<p v-if="devCode" class="mt-2 text-xs font-bold text-brand-emerald-text bg-brand-emerald-light rounded-lg px-3 py-2 inline-block">Dev rejim: kod — {{ devCode }}</p>
					<label class="block text-xs font-bold text-ink-soft mt-7 mb-2">Tasdiqlash kodi</label>
					<input
						v-model="code" type="text" inputmode="numeric" maxlength="4" placeholder="0000"
						class="w-full border-2 border-brand-sky rounded-2xl px-4 py-4 outline-none text-2xl font-extrabold tracking-[0.4em] text-center"
						style="box-shadow: 0 0 0 4px rgba(14,165,233,.1)"
						@keyup.enter="submitCode"
					/>
					<p v-if="errorMessage" class="text-xs font-semibold text-red-600 mt-2">{{ errorMessage }}</p>
					<button type="button" :disabled="isLoading" class="w-full border-0 cursor-pointer font-bold text-base text-white bg-main py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60" @click="submitCode">
						{{ isLoading ? 'Tekshirilmoqda…' : 'Tasdiqlash' }}
					</button>
				</template>
			</div>
		</div>
	</main>
</template>
