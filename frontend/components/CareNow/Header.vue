<script setup lang="ts">
import type { AuthUser } from '~/composables/useAuth'

const { locale, setLocale } = useI18n()
const { fetchMe } = useAuth()
const token = useToken()

const city = useCity()
const cityModal = useCityModal()

// Shared across pages within the SPA session (useState persists across
// client-side navigation, resets on hard reload) so we don't refetch
// /auth/me on every single page — every page includes <CareNowHeader />
// directly, there's no shared layout to hoist this into.
const currentUser = useState<AuthUser | null>('cn-header-user', () => null)

async function loadCurrentUser() {
	currentUser.value = token.value ? await fetchMe() : null
}
onMounted(loadCurrentUser)
onActivated(loadCurrentUser)
watch(token, loadCurrentUser)

const roleHome: Record<string, string> = { CLINIC_ADMIN: '/clinic-admin', DOCTOR: '/doctor-panel', SUPER_ADMIN: '/super-admin' }
const accountLink = computed(() => (currentUser.value ? roleHome[currentUser.value.role] || '/profile' : '/login'))

function initials(name: string | null) {
	if (!name) return '?'
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleDark() {
	colorMode.preference = isDark.value ? 'light' : 'dark'
}

type LocaleCode = 'uz' | 'ru' | 'en'
const langs: { code: LocaleCode; label: string }[] = [
	{ code: 'uz', label: "O'zbekcha" },
	{ code: 'ru', label: 'Русский' },
	{ code: 'en', label: 'English' },
]
const langOpen = ref(false)
const mobileMenuOpen = ref(false)
function pickLang(code: LocaleCode) {
	setLocale(code)
	langOpen.value = false
	mobileMenuOpen.value = false
}

const navLinks = computed(() => [
	{ label: 'cn.nav.doctors', to: '/doctors' },
	{ label: 'cn.nav.clinics', to: '/clinics' },
	{ label: 'cn.nav.services', to: '/services' },
	{ label: 'cn.nav.prices', to: '/services' },
])
</script>

<template>
	<header class="flex items-center gap-3 md:gap-6 px-4 md:px-12 border-b border-line-soft bg-card">
		<NuxtLink to="/" class="shrink-0 py-5">
			<CareNowLogo :size="36" />
		</NuxtLink>

		<button
			type="button"
			class="hidden md:flex items-center gap-2 text-sm font-semibold text-ink-soft bg-surface border border-line-soft rounded-xl px-4 py-2 cursor-pointer"
			@click="cityModal = true"
		>
			<UIcon name="tabler:map-pin" class="text-brand-sky text-base" />
			{{ city }}
			<UIcon name="tabler:chevron-down" class="text-ink-mute text-sm" />
		</button>
		<nav class="hidden lg:flex items-center gap-1 text-sm font-semibold text-ink-soft">
			<NuxtLink
				v-for="link in navLinks"
				:key="link.to + link.label"
				:to="link.to"
				class="flex items-center min-h-11 px-3 rounded-xl hover:text-main hover:bg-surface transition-colors"
			>
				{{ $t(link.label) }}
			</NuxtLink>
		</nav>

		<div class="flex-1" />

		<button
			type="button"
			class="hidden sm:flex shrink-0 w-11 h-11 rounded-xl bg-surface border border-line-soft items-center justify-center cursor-pointer"
			:aria-label="isDark ? 'Yorug\' rejim' : 'Tungi rejim'"
			@click="toggleDark"
		>
			<UIcon :name="isDark ? 'tabler:sun-filled' : 'tabler:moon-stars'" class="text-ink-soft text-base" />
		</button>

		<div class="relative shrink-0">
			<button
				type="button"
				class="hidden sm:flex items-center gap-2 text-sm font-bold text-ink bg-surface border border-line-soft rounded-xl px-4 py-3 cursor-pointer"
				@click="langOpen = !langOpen"
			>
				<UIcon name="tabler:world" class="text-ink-soft text-base" />
				{{ locale.toUpperCase() }}
				<UIcon name="tabler:chevron-down" class="text-ink-mute text-xs" />
			</button>
			<div
				v-if="langOpen"
				class="absolute top-[calc(100%+8px)] right-0 z-50 w-44 bg-card border border-line rounded-2xl shadow-xl p-2"
			>
				<button
					v-for="l in langs"
					:key="l.code"
					type="button"
					class="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm cursor-pointer"
					:class="l.code === locale ? 'font-bold text-main bg-brand-sky-light' : 'font-semibold text-ink-soft hover:bg-surface'"
					@click="pickLang(l.code)"
				>
					{{ l.label }}
					<UIcon v-if="l.code === locale" name="tabler:check" class="text-main text-base" />
				</button>
			</div>
		</div>

		<NuxtLink
			v-if="!currentUser"
			to="/login"
			class="shrink-0 text-sm font-bold text-ink min-h-11 flex items-center px-4 rounded-xl hover:bg-surface transition-colors"
		>
			{{ $t('cn.header.login') }}
		</NuxtLink>
		<NuxtLink
			v-else
			:to="accountLink"
			class="shrink-0 flex items-center gap-2 text-sm font-bold text-ink min-h-11 px-3 rounded-xl hover:bg-surface transition-colors"
		>
			<span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0" style="width:28px;height:28px;background: linear-gradient(135deg,#0EA5E9,#0284C7)">{{ initials(currentUser.name) }}</span>
			<span class="hidden sm:inline">{{ currentUser.name || 'Profil' }}</span>
		</NuxtLink>
		<NuxtLink
			to="/business"
			class="hidden md:flex shrink-0 text-sm font-bold text-main bg-card border-[1.5px] border-brand-sky-border min-h-11 items-center px-5 rounded-xl hover:bg-brand-sky-light transition-colors"
		>
			{{ $t('cn.header.addClinic') }}
		</NuxtLink>
		<button
			type="button"
			class="lg:hidden shrink-0 w-11 h-11 rounded-xl bg-surface flex items-center justify-center cursor-pointer"
			:aria-expanded="mobileMenuOpen"
			aria-label="Menyu"
			@click="mobileMenuOpen = !mobileMenuOpen"
		>
			<UIcon :name="mobileMenuOpen ? 'tabler:x' : 'tabler:menu-2'" class="text-lg" />
		</button>
	</header>

	<div v-if="mobileMenuOpen" class="lg:hidden border-b border-line-soft bg-card px-6 py-4 flex flex-col gap-1">
		<NuxtLink
			v-for="link in navLinks"
			:key="link.to + link.label"
			:to="link.to"
			class="flex items-center min-h-11 px-3 rounded-xl text-sm font-semibold text-ink-soft hover:bg-surface"
			@click="mobileMenuOpen = false"
		>
			{{ $t(link.label) }}
		</NuxtLink>
		<NuxtLink
			to="/business"
			class="flex items-center min-h-11 px-3 rounded-xl text-sm font-bold text-main hover:bg-surface"
			@click="mobileMenuOpen = false"
		>
			{{ $t('cn.header.addClinic') }}
		</NuxtLink>
		<div class="h-px bg-line-soft my-2" />
		<button
			type="button"
			class="flex items-center gap-2 min-h-11 px-3 rounded-xl hover:bg-surface cursor-pointer"
			@click="cityModal = true; mobileMenuOpen = false"
		>
			<UIcon name="tabler:map-pin" class="text-brand-sky text-base shrink-0" />
			<span class="text-sm font-semibold text-ink-soft">{{ city }}</span>
		</button>
		<div class="flex gap-2 px-3">
			<button
				v-for="l in langs" :key="l.code" type="button"
				class="flex-1 text-sm font-bold py-2 rounded-xl cursor-pointer"
				:class="l.code === locale ? 'text-main bg-brand-sky-light' : 'text-ink-soft bg-surface'"
				@click="pickLang(l.code)"
			>{{ l.code.toUpperCase() }}</button>
		</div>
		<button
			type="button"
			class="flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm font-semibold text-ink-soft hover:bg-surface cursor-pointer"
			@click="toggleDark"
		>
			<UIcon :name="isDark ? 'tabler:sun-filled' : 'tabler:moon-stars'" class="text-base" />
			{{ isDark ? "Yorug' rejim" : 'Tungi rejim' }}
		</button>
	</div>
</template>
