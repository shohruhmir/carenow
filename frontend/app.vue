<script setup lang="ts">
//===============================-< imports >-===============================
//> store
import { useStore } from '~/store/useful.store'
//> utils
const route = useRoute()
// const { t, locale } = useI18n();
// const localePath = useLocalePath();
const store = useStore()

watch(route, () => {
	if (store.isScroolBlocked) {
		store.enableScrool()
	}
})

//===============================-< on app load >-===============================
//> variables
//> functions
onMounted(() => {
	const savedCity = localStorage.getItem(CITY_STORAGE_KEY)
	if (savedCity && cities.includes(savedCity)) {
		useCity().value = savedCity
	} else {
		useCityModal().value = true
	}
})
</script>
<template>
	<div>
		<NuxtRouteAnnouncer />
		<UApp :toaster="{position: 'top-right', duration: 2000}">
			<NuxtLayout />
			<CareNowCityModal />
		</UApp>
	</div>
</template>
