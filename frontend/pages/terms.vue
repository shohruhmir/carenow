<script lang="ts" setup>
const { t } = useSiteContent()

const title = computed(() => t('legal.terms.title', 'Foydalanish shartlari'))
const paragraphs = computed(() =>
	t(
		'legal.terms.body',
		"Ushbu sahifa CareNow platformasidan foydalanish shartlarini tavsiflaydi. Platformadan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.\n\nCareNow — bemorlar va stomatologiya klinikalarini bog'laydigan platforma. Platforma orqali amalga oshirilgan yozilishlar, ko'rsatilgan narxlar va xizmatlar tegishli klinika tomonidan taqdim etiladi va ular uchun javobgardir.\n\nPlatformadan noqonuniy yoki boshqa foydalanuvchilarga zarar yetkazadigan tarzda foydalanish taqiqlanadi.\n\nUshbu shartlar vaqti-vaqti bilan yangilanishi mumkin. Savollaringiz bo'lsa, biz bilan bog'laning.",
	).split('\n\n'),
)
</script>

<template>
	<main>
		<CareNowHeader />

		<div class="container py-10 max-w-3xl">
			<div class="text-xs text-ink-mute mb-2">Bosh sahifa / {{ title }}</div>
			<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ title }}</h1>
			<div class="mt-6 flex flex-col gap-4">
				<p v-for="(para, i) in paragraphs" :key="i" class="text-sm text-ink-soft leading-relaxed">{{ para }}</p>
			</div>
		</div>

		<CareNowFooter />
	</main>
</template>
