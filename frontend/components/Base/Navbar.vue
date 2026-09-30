<script setup lang="ts">
//===============================-< imports >-===============================
// import { useRouter } from 'vue-router'
// const router = useRouter()

//utils
// const token = useToken()

// ===================== multi language =============================
// variables
const { locale, setLocale } = useI18n()
// const localePath = useLocalePath()

// get data
// const companyData = useCompanyData();
// async function getdata() {
//   const res = await Service.get(urls.allSettingsGet, locale.value, token.value);
//   companyData.value = res?.data[0];
// }

// getdata();
//===============================-< languages >-===============================
//> variables
type TLocale = 'uz' | 'ru' | 'en'
const locales = ['Uz', 'Ru', 'En']
console.log(locale.value)

const currentLang = ref<TLocale>(locale.value)

//> functions
watch(currentLang, () => {
	setLocale(currentLang.value.toLowerCase() as TLocale)
})

//===============================-< on page load >-===============================
onMounted(() => {
	currentLang.value = locale.value
	console.log(currentLang.value)
})
</script>
<template>
	<nav
		class="fixed top-0 left-0 bg-white w-full z-50 shadow-md border-b border-b-gray-300"
	>
		<div class="container mx-auto">
			<div class="py-4 flex items-center justify-between">
				<h2>
					<NuxtLink to="/">Logo</NuxtLink>
				</h2>
				<USelect
					v-model="currentLang"
					leading-icon="material-symbols:language"
					:items="locales"
					size="md"
					class="border border-gray-300"
				>
					<template #default="{ modelValue }">
						<span class="capitalize">{{ modelValue }}</span>
					</template>
				</USelect>
			</div>
		</div>
	</nav>
</template>
