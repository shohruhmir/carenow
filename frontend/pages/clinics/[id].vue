<script lang="ts" setup>
import type { ApiClinic } from '~/composables/useClinicsApi'

const route = useRoute()
const { fetchClinicRaw } = useClinicsApi()

const clinic = ref<ApiClinic | null>(null)
const isLoading = ref(true)
const notFound = ref(false)

const tabs = ['Shifokorlar', 'Klinika haqida', 'Filiallar', 'Sharhlar', 'Narxlar']
const activeTab = ref(0)

const selectedBranch = ref(0)
const activeBranch = computed(() => clinic.value?.branches[selectedBranch.value] ?? clinic.value?.branches[0])
const branchOpen = ref(false)
function pickBranch(i: number) {
	selectedBranch.value = i
	branchOpen.value = false
}

// Derived, not fabricated — the real set of specialties among this
// clinic's actual doctors (no separate "specialties" model exists).
const specialties = computed(() => {
	if (!clinic.value?.doctors) return []
	return [...new Set(clinic.value.doctors.map((d) => d.specialty))]
})

function branchFor(branchId: string) {
	return clinic.value?.branches.find((b) => b.id === branchId)
}
function initials(name: string) {
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase()
}

onMounted(async () => {
	const slug = route.params.id as string
	clinic.value = await fetchClinicRaw(slug)
	if (!clinic.value) notFound.value = true
	isLoading.value = false
})
</script>

<template>
	<main v-if="isLoading">
		<CareNowHeader />
		<div class="container py-16 text-center text-sm text-ink-mute">Yuklanmoqda…</div>
	</main>
	<main v-else-if="notFound">
		<CareNowHeader />
		<div class="container py-16 text-center text-sm text-ink-mute">Klinika topilmadi</div>
	</main>
	<main v-else-if="clinic">
		<CareNowHeader />

		<!-- hero -->
		<div class="container pt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-5 lg:items-stretch">
			<div class="flex flex-col gap-4">
				<div class="relative">
					<button
						type="button"
						class="w-full flex items-center justify-between bg-card border-[1.5px] border-brand-sky-border rounded-2xl px-5 min-h-14 shadow-sm cursor-pointer"
						:aria-expanded="branchOpen"
						@click="branchOpen = !branchOpen"
					>
						<span class="text-base font-semibold">{{ activeBranch?.name }}</span>
						<UIcon name="tabler:chevron-down" class="text-main text-lg transition-transform" :class="branchOpen ? 'rotate-180' : ''" />
					</button>
					<div
						v-if="branchOpen"
						class="absolute top-[calc(100%+8px)] left-0 right-0 z-30 bg-card border border-line rounded-2xl shadow-xl p-2 max-h-72 overflow-y-auto"
					>
						<button
							v-for="(b, i) in clinic.branches" :key="b.id" type="button"
							class="w-full text-left px-3 py-3 rounded-xl cursor-pointer"
							:class="i === selectedBranch ? 'bg-brand-sky-light' : 'hover:bg-surface'"
							@click="pickBranch(i)"
						>
							<div class="flex items-center justify-between gap-2">
								<span class="text-sm" :class="i === selectedBranch ? 'font-bold text-main' : 'font-semibold text-ink'">{{ b.name }}</span>
								<UIcon v-if="i === selectedBranch" name="tabler:check" class="text-main text-base shrink-0" />
							</div>
							<div class="text-xs text-ink-mute mt-0.5">{{ b.address }}</div>
						</button>
					</div>
				</div>
				<div class="flex-1 flex flex-col bg-card border border-line rounded-3xl p-6 shadow-sm">
					<div class="flex gap-5">
						<div class="w-[110px] h-[110px] rounded-2xl border border-line-soft flex items-center justify-center text-3xl font-extrabold shrink-0" style="background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0EA5E9">{{ initials(clinic.name) }}</div>
						<div class="flex-1 min-w-0 pt-1">
							<div class="flex items-center gap-2">
								<span class="text-2xl font-extrabold tracking-tight">{{ clinic.name }}</span>
								<UIcon name="tabler:rosette-discount-check-filled" class="text-brand-sky text-lg" />
							</div>
							<div class="flex items-center gap-2 mt-3 text-sm">
								<UIcon name="tabler:star-filled" class="text-brand-amber text-sm" />
								<span class="font-extrabold">{{ clinic.rating.toFixed(1) }}</span>
							</div>
							<div v-if="clinic.is247" class="flex items-center gap-2 mt-4 text-sm">
								<span class="w-4 h-4 rounded-full bg-brand-emerald flex items-center justify-center shrink-0"><UIcon name="tabler:clock" class="text-white text-[10px]" /></span>
								<span class="font-extrabold text-brand-emerald-text">Kecha-kunduz · 24/7</span>
							</div>
						</div>
					</div>
					<div class="flex gap-4 mt-auto pt-4 border-t border-line-soft flex-wrap">
						<button
							v-for="(t, i) in tabs" :key="t" type="button"
							class="cursor-pointer text-sm font-bold min-h-11 flex items-center px-1 border-b-[3px] transition-colors"
							:class="i === activeTab ? 'text-main border-main' : 'text-ink-mute border-transparent'"
							@click="activeTab = i"
						>{{ t }}</button>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_140px] grid-rows-3 gap-3 h-[300px] lg:h-[404px]">
				<div class="row-span-3 rounded-2xl overflow-hidden border border-line"><CareNowImagePlaceholder label="Asosiy foto" /></div>
				<div class="rounded-2xl overflow-hidden border border-line"><CareNowImagePlaceholder label="foto" /></div>
				<div class="rounded-2xl overflow-hidden border border-line"><CareNowImagePlaceholder label="foto" /></div>
				<div class="rounded-2xl overflow-hidden border border-line"><CareNowImagePlaceholder label="foto" /></div>
			</div>
		</div>

		<!-- SHIFOKORLAR -->
		<div v-if="activeTab === 0" class="container py-9">
			<div class="flex items-baseline gap-2"><h2 class="text-2xl font-extrabold tracking-tight">Shifokorlar</h2><span class="text-2xl font-extrabold text-ink-mute/60">· {{ clinic.doctors?.length ?? 0 }}</span></div>
			<div v-if="!clinic.doctors?.length" class="text-sm text-ink-mute py-10 text-center">Shifokorlar hali qo'shilmagan</div>
			<div v-else class="flex flex-col gap-4 mt-6">
				<div v-for="d in clinic.doctors" :key="d.id" class="bg-card border border-line rounded-3xl shadow-sm p-7 flex gap-6 flex-col sm:flex-row sm:items-center">
					<div class="flex flex-col items-center gap-2 w-[120px] shrink-0">
						<div class="w-[100px] h-[100px] rounded-full flex items-center justify-center text-2xl font-extrabold" style="background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color: #0369A1">{{ initials(d.name) }}</div>
						<div class="flex items-center gap-1"><UIcon name="tabler:star-filled" class="text-brand-amber text-xs" /><span class="text-sm font-extrabold">{{ d.rating.toFixed(1) }}</span></div>
						<div class="text-xs font-semibold text-main">{{ d.reviewsCount }} sharh</div>
					</div>
					<div class="flex-1 min-w-0">
						<NuxtLink :to="`/doctors/${d.id}`" class="text-xl font-extrabold tracking-tight leading-tight hover:text-main">{{ d.name }}</NuxtLink>
						<div class="text-sm text-ink-mute mt-2">{{ d.specialty }} · staj {{ d.experienceYrs }} yil</div>
						<div class="text-sm font-bold mt-3">{{ branchFor(d.branchId)?.name }}</div>
						<div class="text-sm text-ink-mute mt-1">{{ branchFor(d.branchId)?.address }}</div>
					</div>
					<NuxtLink :to="`/booking/${d.id}`" class="text-sm font-bold text-white bg-main px-6 py-3 rounded-xl shrink-0 text-center">Qabulga yozilish</NuxtLink>
				</div>
			</div>
		</div>

		<!-- KLINIKA HAQIDA -->
		<div v-else-if="activeTab === 1" class="container py-9">
			<div class="bg-card border border-line rounded-3xl p-8 shadow-sm max-w-3xl">
				<h2 class="text-xl font-extrabold mb-5">Klinika haqida</h2>
				<p class="text-base leading-relaxed text-ink-soft">{{ clinic.desc || "Ma'lumot hali qo'shilmagan" }}</p>
				<template v-if="specialties.length">
					<div class="h-px bg-line-soft my-7" />
					<div class="text-base font-extrabold mb-4">Mutaxassisliklar</div>
					<div class="flex gap-2 flex-wrap">
						<span v-for="s in specialties" :key="s" class="text-sm font-semibold text-ink-soft bg-surface min-h-10 inline-flex items-center px-4 rounded-full">{{ s }}</span>
					</div>
				</template>
			</div>
		</div>

		<!-- FILIALLAR -->
		<div v-else-if="activeTab === 2" class="container py-9">
			<div class="flex items-baseline gap-2 mb-5"><h2 class="text-xl font-extrabold">Filiallar</h2><span class="text-xl font-extrabold text-ink-mute/60">· {{ clinic.branches.length }}</span></div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div v-for="b in clinic.branches" :key="b.id" class="bg-card border border-line rounded-2xl p-6 shadow-sm">
					<div class="text-base font-extrabold">{{ b.name }}</div>
					<div class="text-sm text-ink-mute mt-2">{{ b.address }}</div>
					<div class="flex items-center gap-4 mt-4 pt-4 border-t border-line-soft text-sm text-ink-mute">
						<span>{{ clinic.doctors?.filter(d => d.branchId === b.id).length ?? 0 }} shifokor</span><span class="text-line">·</span><span>{{ b.phone }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- SHARHLAR -->
		<div v-else-if="activeTab === 3" class="container py-9">
			<div class="bg-card border border-line rounded-3xl p-8 shadow-sm">
				<h2 class="text-xl font-extrabold mb-5">Bemorlar sharhlari</h2>
				<div class="flex items-baseline gap-3">
					<span class="text-4xl font-extrabold tracking-tight text-main">{{ clinic.rating.toFixed(1) }}</span>
				</div>
				<div class="text-sm text-ink-mute py-8 text-center mt-4 border border-line-soft rounded-2xl">Sharh matnlari hali mavjud emas</div>
			</div>
		</div>

		<!-- NARXLAR -->
		<div v-else class="container py-9">
			<div class="bg-card border border-line rounded-3xl p-8 shadow-sm">
				<h2 class="text-xl font-extrabold mb-2">Narxlar ro'yxati</h2>
				<div v-if="!clinic.services?.length" class="text-sm text-ink-mute py-8 text-center">Narxlar hali qo'shilmagan</div>
				<div v-else v-for="s in clinic.services" :key="s.id" class="flex items-center justify-between min-h-14 border-b border-line-soft last:border-b-0">
					<span class="text-base">{{ s.name }}</span>
					<span class="text-base font-bold">{{ s.price.toLocaleString('ru-RU') }} so'm</span>
				</div>
			</div>
		</div>

		<CareNowFooter />
	</main>
</template>
