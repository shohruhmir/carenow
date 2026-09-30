<script lang="ts" setup>
const { t } = useSiteContent()

const title = computed(() => t('legal.privacy.title', 'Maxfiylik siyosati'))
const paragraphs = computed(() =>
	t(
		'legal.privacy.body',
		"Ushbu sahifa CareNow platformasi foydalanuvchilarning shaxsiy ma'lumotlarini qanday to'plashi, ishlatishi va saqlashini tavsiflaydi.\n\nBiz sizning ismingiz, telefon raqamingiz va yozilish tarixingiz kabi ma'lumotlarni xizmat ko'rsatish maqsadida to'playmiz. Bu ma'lumotlar uchinchi shaxslarga sizning roziligingizsiz berilmaydi, qonun talab qilgan hollar bundan mustasno.\n\nSiz istalgan vaqtda o'z ma'lumotlaringizni ko'rish, tahrirlash yoki o'chirishni so'rashingiz mumkin.\n\nSavollaringiz bo'lsa, biz bilan bog'laning.",
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
