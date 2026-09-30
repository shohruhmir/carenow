<script setup lang="ts">
const { locale } = useI18n()
const { t } = useSiteContent()

const footerLinks: Record<string, { patients: string[]; clinics: string[]; cities: string[] }> = {
	uz: {
		patients: ['Shifokorlar', 'Klinikalar', 'Xizmatlar va narxlar', 'Mobil ilova', 'Yordam markazi'],
		clinics: ["Klinikani ro'yxatdan o'tkazish", 'Shaxsiy kabinet', 'Tariflar', 'Maxfiylik siyosati', 'Foydalanish shartlari'],
		cities: ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona"],
	},
	ru: {
		patients: ['Врачи', 'Клиники', 'Услуги и цены', 'Мобильное приложение', 'Центр поддержки'],
		clinics: ['Зарегистрировать клинику', 'Личный кабинет', 'Тарифы', 'Политика конфиденциальности', 'Условия использования'],
		cities: ['Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана'],
	},
	en: {
		patients: ['Doctors', 'Clinics', 'Services & prices', 'Mobile app', 'Help center'],
		clinics: ['Register your clinic', 'Business dashboard', 'Pricing', 'Privacy policy', 'Terms of use'],
		cities: ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana'],
	},
}

const patients = computed(() => footerLinks[locale.value]?.patients ?? footerLinks.uz.patients)
const clinicsLinks = computed(() => footerLinks[locale.value]?.clinics ?? footerLinks.uz.clinics)
const cities = computed(() => footerLinks[locale.value]?.cities ?? footerLinks.uz.cities)
const ukCities = computed(() => footerLinks.uz.cities)

const patientRoutes = ['/doctors', '/clinics', '/services', '#', '#']
// clinicsLinks index order (see footerLinks above): 0 register, 1 dashboard,
// 2 pricing, 3 privacy, 4 terms — only 0/3/4 have real routes so far.
const clinicsRoutes = ['/business', '#', '#', '/privacy', '/terms']

const city = useCity()
function pickCity(i: number) {
	const c = ukCities.value[i]
	if (c) {
		city.value = c
		if (import.meta.client) localStorage.setItem(CITY_STORAGE_KEY, c)
	}
}
</script>

<template>
	<footer class="bg-surface border-t border-line-soft">
		<div class="container py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
			<div>
				<CareNowLogo :size="30" />
				<p class="mt-4 text-sm text-ink-mute leading-relaxed max-w-[260px]">{{ t('footer.description', $t('cn.footer.tagline')) }}</p>
				<div class="mt-5 text-sm text-ink-mute">© {{ new Date().getFullYear() }} CareNow. {{ $t('cn.footer.rights') }}</div>
			</div>
			<div>
				<div class="text-sm font-extrabold mb-4">{{ $t('cn.footer.cities') }}</div>
				<div class="flex flex-col gap-2 text-sm text-ink-mute">
					<NuxtLink
						v-for="(c, i) in cities" :key="c" to="/doctors"
						class="text-left hover:text-main transition-colors cursor-pointer"
						@click="pickCity(i)"
					>{{ c }}</NuxtLink>
				</div>
			</div>
			<div>
				<div class="text-sm font-extrabold mb-4">{{ $t('cn.footer.forPatients') }}</div>
				<div class="flex flex-col gap-2 text-sm text-ink-mute">
					<NuxtLink v-for="(link, i) in patients" :key="link" :to="patientRoutes[i] ?? '#'" class="hover:text-main transition-colors">{{ link }}</NuxtLink>
				</div>
			</div>
			<div>
				<div class="text-sm font-extrabold mb-4">{{ $t('cn.footer.forClinics') }}</div>
				<div class="flex flex-col gap-2 text-sm text-ink-mute">
					<NuxtLink v-for="(link, i) in clinicsLinks" :key="link" :to="clinicsRoutes[i] ?? '#'" class="hover:text-main transition-colors">{{ link }}</NuxtLink>
				</div>
			</div>
		</div>
	</footer>
</template>
