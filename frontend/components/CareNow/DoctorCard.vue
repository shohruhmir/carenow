<script setup lang="ts">
import type { DoctorSummary } from '~/composables/useDoctorsApi'

withDefaults(defineProps<{ doctor: DoctorSummary; variant?: 'grid' | 'list' }>(), { variant: 'grid' })
</script>

<template>
	<!-- GRID (homepage) -->
	<NuxtLink
		v-if="variant === 'grid'"
		:to="`/doctors/${doctor.id}`"
		class="block bg-card border border-line rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
	>
		<div class="flex gap-4">
			<div
				class="w-[72px] h-[72px] rounded-2xl shrink-0 flex items-center justify-center text-2xl font-extrabold"
				:style="{ background: doctor.bg, color: doctor.fg }"
			>{{ doctor.init }}</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<span class="text-base font-bold truncate">{{ doctor.name }}</span>
					<UIcon name="tabler:rosette-discount-check-filled" class="text-brand-sky text-base shrink-0" />
				</div>
				<div class="text-sm text-ink-mute mt-0.5">{{ doctor.spec }} · {{ doctor.exp }}</div>
				<div class="flex items-center gap-2 mt-2">
					<UIcon name="tabler:star-filled" class="text-brand-amber text-sm" />
					<span class="text-sm font-extrabold">{{ doctor.rating }}</span>
					<span class="text-xs text-ink-mute">· {{ doctor.reviews }} sharh</span>
				</div>
			</div>
		</div>
		<div class="flex items-center gap-2 mt-4 text-xs text-ink-mute">
			<UIcon name="tabler:map-pin" class="text-sm" />{{ doctor.clinic }}
		</div>
		<div class="flex gap-2 mt-4 flex-wrap">
			<span v-for="s in doctor.slots" :key="s.label" class="text-xs font-bold text-main bg-brand-sky-light min-h-11 inline-flex items-center px-3.5 rounded-xl">{{ s.label }}</span>
		</div>
		<div class="flex items-center justify-between mt-5 pt-4 border-t border-line-soft">
			<div>
				<span v-if="doctor.oldPrice" class="text-xs text-ink-mute line-through">{{ doctor.oldPrice }}</span>
				<div class="flex items-center gap-2">
					<span class="text-lg font-extrabold">{{ doctor.price }}</span>
					<span v-if="doctor.disc" class="text-[11px] font-extrabold text-brand-emerald-text bg-brand-emerald-light px-2 py-0.5 rounded-lg">{{ doctor.disc }} CareNow</span>
				</div>
			</div>
			<span class="text-sm font-bold text-white bg-main px-5 py-3 rounded-xl">{{ $t('cn.buttons.book') }}</span>
		</div>
	</NuxtLink>

	<!-- LIST (search results) -->
	<div v-else class="relative bg-card border rounded-[20px] p-6 shadow-sm" :class="doctor.promo ? 'border-brand-sky-border' : 'border-line'">
		<span v-if="doctor.promo" class="absolute -top-2.5 left-6 text-xs font-extrabold text-amber-900 bg-brand-amber px-3 py-1 rounded-lg">PROMO</span>
		<div class="flex gap-5 flex-col sm:flex-row">
			<div class="flex sm:flex-col items-center gap-2 shrink-0">
				<div class="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-extrabold" :style="{ background: doctor.bg, color: doctor.fg }">{{ doctor.init }}</div>
				<div class="flex items-center gap-1 bg-brand-amber-light px-3 py-1 rounded-lg">
					<UIcon name="tabler:star-filled" class="text-brand-amber text-xs" />
					<span class="text-xs font-extrabold text-brand-amber-text">{{ doctor.rating }}</span>
				</div>
				<span class="text-xs text-main font-semibold">{{ doctor.reviews }} sharh</span>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<span class="text-lg font-extrabold">{{ doctor.name }}</span>
					<UIcon name="tabler:rosette-discount-check-filled" class="text-brand-sky text-base shrink-0" />
				</div>
				<div class="text-sm text-ink-mute mt-1">{{ doctor.spec }} · staj {{ doctor.exp }}</div>
				<div class="flex items-center gap-2 mt-3 text-sm text-ink-soft">
					<UIcon name="tabler:map-pin" class="text-sm" />
					<b>{{ doctor.clinic }}</b> · {{ doctor.addr }} · <span class="text-main font-bold">{{ $t('cn.buttons.onMap') }}</span>
				</div>
				<div class="text-xs font-bold text-ink-soft mt-4">Bugun bo'sh soatlar</div>
				<div class="flex gap-2 mt-2 flex-wrap">
					<span
						v-for="s in doctor.slots" :key="s.label"
						class="text-xs font-bold min-h-11 inline-flex items-center px-4 rounded-xl"
						:class="s.active ? 'text-white bg-main' : 'text-ink bg-surface'"
					>{{ s.label }}</span>
				</div>
			</div>
			<div class="flex sm:flex-col items-end justify-between gap-3 shrink-0">
				<div class="text-right">
					<div v-if="doctor.oldPrice" class="text-xs text-ink-mute line-through">{{ doctor.oldPrice }}</div>
					<div class="text-lg font-extrabold mt-0.5">{{ doctor.price }}</div>
					<span v-if="doctor.disc" class="text-[11px] font-extrabold text-brand-emerald-text bg-brand-emerald-light px-2 py-0.5 rounded-lg">{{ doctor.disc }} CareNow</span>
				</div>
				<NuxtLink :to="`/doctors/${doctor.id}`" class="text-sm font-bold text-white bg-main px-7 py-3 rounded-xl shadow-lg shadow-brand-sky/20">{{ $t('cn.buttons.book') }}</NuxtLink>
			</div>
		</div>
	</div>
</template>
