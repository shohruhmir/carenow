<script setup lang="ts">
const city = useCity()
const open = useCityModal()

function persist(value: string) {
	if (import.meta.client) localStorage.setItem(CITY_STORAGE_KEY, value)
}

function pick(c: string) {
	city.value = c
	persist(c)
	open.value = false
}

function close() {
	persist(city.value)
	open.value = false
}
</script>

<template>
	<div
		v-if="open"
		class="fixed inset-0 z-[100] flex items-center justify-center p-4"
		style="background: rgba(15,23,42,.6)"
		@click.self="close"
	>
		<div class="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
			<div class="flex items-center justify-between px-6 py-5 border-b border-line-soft">
				<h2 class="text-lg font-extrabold">Shaharni tanlang</h2>
				<button
					type="button"
					class="w-9 h-9 rounded-xl bg-surface flex items-center justify-center cursor-pointer shrink-0"
					aria-label="Yopish"
					@click="close"
				>
					<UIcon name="tabler:x" class="text-lg" />
				</button>
			</div>
			<div class="max-h-[60vh] overflow-y-auto">
				<button
					v-for="c in cities" :key="c" type="button"
					class="w-full text-center px-6 py-4 border-b border-line-soft last:border-b-0 cursor-pointer text-base transition-colors"
					:class="c === city ? 'font-bold text-main bg-brand-sky-light' : 'font-semibold text-ink hover:bg-surface'"
					@click="pick(c)"
				>{{ c }}</button>
			</div>
		</div>
	</div>
</template>
