<script setup lang="ts">
import { badgeColor, type ClinicSummary } from '~/composables/useClinicsApi'

const props = defineProps<{ clinic: ClinicSummary }>()

const selectedBranch = ref(0)
const hoursOpen = ref(false)
const activeBranch = computed(() => props.clinic.branches[selectedBranch.value] ?? props.clinic.branches[0])
</script>

<template>
	<div class="bg-card border border-line rounded-3xl p-6 md:p-8 shadow-md grid grid-cols-1 md:grid-cols-[170px_1fr_auto_320px] gap-6 md:gap-7">
		<!-- logo + rating -->
		<div class="flex md:flex-col items-center gap-3">
			<div
				class="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-3xl border border-line-soft flex items-center justify-center text-3xl font-extrabold shrink-0"
				:style="{ background: clinic.logoBg, color: clinic.logoFg }"
			>{{ clinic.logo }}</div>
			<div class="flex flex-col items-center gap-1">
				<div class="flex items-center gap-1">
					<UIcon name="tabler:star-filled" class="text-brand-amber text-sm" />
					<span class="text-lg font-extrabold">{{ clinic.rating }}</span>
				</div>
			</div>
		</div>

		<!-- name + desc -->
		<div>
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-xl font-extrabold tracking-tight">{{ clinic.name }}</span>
				<UIcon name="tabler:rosette-discount-check-filled" class="text-brand-sky text-lg" />
			</div>
			<div class="flex gap-2 mt-3 flex-wrap">
				<span
					v-for="b in clinic.badges" :key="b.label"
					class="text-xs font-bold px-3 py-1 rounded-lg"
					:style="{ color: badgeColor(b.kind).fg, background: badgeColor(b.kind).bg }"
				>{{ b.label }}</span>
			</div>
			<p class="text-sm text-ink-mute leading-relaxed mt-3 max-w-[560px]">
				{{ clinic.desc }} <span class="text-main font-bold">{{ $t('cn.buttons.details') }}</span>
			</p>
			<div class="flex gap-3 mt-5">
				<NuxtLink :to="`/clinics/${clinic.slug}`" class="text-sm font-bold text-white bg-main px-7 py-3 rounded-xl shadow-lg shadow-brand-sky/20">{{ $t('cn.buttons.book') }}</NuxtLink>
				<NuxtLink :to="`/clinics/${clinic.slug}`" class="text-sm font-bold text-ink bg-card border-[1.5px] border-line px-6 py-3 rounded-xl">Shifokorlar ({{ clinic.docCount }})</NuxtLink>
			</div>
		</div>

		<!-- branch rail -->
		<div class="border-l border-line-soft pl-5 hidden md:block">
			<div class="text-xs font-bold tracking-wide uppercase text-ink-mute mb-3">Filial</div>
			<div class="flex flex-col gap-2">
				<button
					v-for="(b, i) in clinic.branches" :key="b.id" type="button"
					class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold cursor-pointer transition-colors"
					:class="i === selectedBranch ? 'bg-main text-white' : 'bg-surface text-ink-soft'"
					@click="selectedBranch = i"
				>{{ i + 1 }}</button>
			</div>
		</div>

		<!-- branch details -->
		<div>
			<div class="flex items-start gap-3">
				<UIcon name="tabler:building-hospital" class="text-ink-mute text-lg mt-0.5 shrink-0" />
				<span class="text-base font-bold leading-tight">{{ activeBranch?.addr }}</span>
			</div>
			<div class="flex items-center gap-2 mt-2 ml-7 text-xs">
				<span class="text-main font-bold">{{ $t('cn.buttons.onMap') }}</span><span class="text-ink-mute">·</span><span class="text-ink-mute">{{ clinic.dist }}</span>
			</div>
			<div v-if="clinic.is247" class="flex items-center gap-3 mt-4">
				<span class="w-4 h-4 rounded-full bg-brand-emerald flex items-center justify-center shrink-0"><UIcon name="tabler:clock" class="text-white text-[10px]" /></span>
				<span class="text-base font-extrabold text-brand-emerald-text">Kecha-kunduz · 24/7</span>
			</div>
			<template v-else-if="clinic.weekly">
				<button type="button" class="flex items-center gap-3 mt-4 cursor-pointer" @click="hoursOpen = !hoursOpen">
					<span class="w-4 h-4 rounded-full bg-brand-emerald flex items-center justify-center shrink-0"><UIcon name="tabler:clock" class="text-white text-[10px]" /></span>
					<span class="text-base font-extrabold">{{ clinic.hoursLabel }}</span>
					<UIcon name="tabler:chevron-down" class="text-main text-sm transition-transform" :class="hoursOpen ? 'rotate-180' : ''" />
				</button>
				<div v-if="hoursOpen" class="ml-7 mt-3 flex flex-col gap-2">
					<div v-for="w in clinic.weekly" :key="w.d" class="flex gap-6 text-sm">
						<span class="w-9 text-ink-mute font-semibold">{{ w.d }}</span>
						<span class="font-bold" :class="w.h === 'Yopiq' ? 'text-red-700' : 'text-ink'">{{ w.h }}</span>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
