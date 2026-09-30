<script lang="ts" setup>
import type { ApiDoctor } from '~/composables/useDoctorsApi'
import type { ApiService } from '~/composables/useClinicsApi'

const route = useRoute()
const router = useRouter()
const { fetchDoctorRaw } = useDoctorsApi()
const { fetchClinicRaw } = useClinicsApi()
const { fetchAvailability, createBooking } = useBookingApi()
const token = useToken()

const doctorId = route.params.doctorId as string

const doctor = ref<ApiDoctor | null>(null)
const services = ref<ApiService[]>([])
const isLoadingDoctor = ref(true)
const notFound = ref(false)

const selectedServiceId = ref<string | null>(null)
const selectedService = computed(() => services.value.find((s) => s.id === selectedServiceId.value) ?? null)

const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const UZ_DOW = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'] // JS getDay(): 0=Sunday..6=Saturday
const weekDow = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

const today = new Date()
today.setHours(0, 0, 0, 0)
const displayMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const monthLabel = computed(() => `${UZ_MONTHS[displayMonth.value.getMonth()]} ${displayMonth.value.getFullYear()}`)

function prevMonth() { displayMonth.value = new Date(displayMonth.value.getFullYear(), displayMonth.value.getMonth() - 1, 1) }
function nextMonth() { displayMonth.value = new Date(displayMonth.value.getFullYear(), displayMonth.value.getMonth() + 1, 1) }

const calendarDays = computed(() => {
	const first = displayMonth.value
	const jsDow = first.getDay() // 0=Sun
	const leading = (jsDow + 6) % 7 // convert to Mon-first index
	const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()

	const days: { date: Date | null; disabled?: boolean }[] = []
	for (let i = 0; i < leading; i++) days.push({ date: null })
	for (let d = 1; d <= daysInMonth; d++) {
		const date = new Date(first.getFullYear(), first.getMonth(), d)
		days.push({ date, disabled: date < today })
	}
	return days
})

const selectedDate = ref<Date>(today)
function selectDay(date: Date) { selectedDate.value = date }
// toISOString() converts to UTC first, which rolls the date back a day in
// any timezone ahead of UTC (e.g. Asia/Tashkent, UTC+5) — format from the
// local y/m/d components instead so the booked date matches what the user
// actually clicked on the calendar.
function toLocalIsoDate(d: Date) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const selectedDateIso = computed(() => toLocalIsoDate(selectedDate.value))
const selectedDateLabel = computed(() => `${UZ_DOW[selectedDate.value.getDay()]}, ${selectedDate.value.getDate()}-${UZ_MONTHS[selectedDate.value.getMonth()].toLowerCase()}`)

const slots = ref<{ time: string; available: boolean }[]>([])
const isLoadingSlots = ref(false)
const selectedTime = ref<string | null>(null)

async function loadSlots() {
	isLoadingSlots.value = true
	selectedTime.value = null
	slots.value = await fetchAvailability(doctorId, selectedDateIso.value)
	isLoadingSlots.value = false
}
watch(selectedDateIso, loadSlots)

const isBooking = ref(false)
const bookingError = ref('')
const bookingResult = ref<{ id: string } | null>(null)

async function submitBooking() {
	bookingError.value = ''
	if (!selectedTime.value) {
		bookingError.value = 'Vaqtni tanlang'
		return
	}
	if (!token.value) {
		router.push({ path: '/login', query: { redirect: route.fullPath } })
		return
	}
	isBooking.value = true
	const res = await createBooking({
		doctorId,
		date: selectedDateIso.value,
		time: selectedTime.value,
		serviceId: selectedServiceId.value ?? undefined,
	})
	isBooking.value = false
	if (!res.success || !res.data) {
		bookingError.value = res.message || 'Band qilishda xatolik yuz berdi'
		loadSlots() // slot may have just been taken — refresh
		return
	}
	bookingResult.value = { id: res.data.id }
}

onMounted(async () => {
	isLoadingDoctor.value = true
	doctor.value = await fetchDoctorRaw(doctorId)
	if (!doctor.value) {
		notFound.value = true
		isLoadingDoctor.value = false
		return
	}
	const clinic = await fetchClinicRaw(doctor.value.clinic.slug)
	services.value = clinic?.services ?? []
	selectedServiceId.value = services.value[0]?.id ?? null
	isLoadingDoctor.value = false
	loadSlots()
})
</script>

<template>
	<main v-if="isLoadingDoctor" class="container py-16 text-center text-sm text-ink-mute">Yuklanmoqda…</main>
	<main v-else-if="notFound" class="container py-16 text-center text-sm text-ink-mute">Shifokor topilmadi</main>
	<main v-else-if="doctor">
		<div class="container py-8">
		<div class="flex items-center gap-4 mb-7 flex-wrap">
			<NuxtLink :to="`/doctors/${doctor.id}`" class="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0"><UIcon name="tabler:chevron-left" class="text-lg" /></NuxtLink>
			<h1 class="text-2xl font-extrabold tracking-tight">Qabulga yozilish</h1>
			<div class="flex-1" />
			<div class="flex items-center flex-wrap gap-2 md:gap-3 text-xs md:text-sm font-bold w-full sm:w-auto">
				<span class="flex items-center gap-2" :class="bookingResult ? 'text-ink-mute' : 'text-main'"><span class="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-xs" :class="bookingResult ? 'bg-surface' : 'bg-main text-white'" style="width:26px;height:26px">1</span>Sana va vaqt</span>
				<span class="w-8 h-0.5 bg-line rounded shrink-0" />
				<span class="flex items-center gap-2" :class="bookingResult ? 'text-main' : 'text-ink-mute'"><span class="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-xs" :class="bookingResult ? 'bg-main text-white' : 'bg-surface'" style="width:26px;height:26px">2</span>Tasdiqlash</span>
			</div>
		</div>

		<!-- confirmation -->
		<div v-if="bookingResult" class="max-w-lg mx-auto bg-card border border-line rounded-3xl p-10 text-center">
			<div class="w-16 h-16 rounded-full bg-brand-emerald-light flex items-center justify-center mx-auto"><UIcon name="tabler:check" class="text-brand-emerald text-3xl" /></div>
			<h2 class="text-xl font-extrabold mt-5">Band qilindi!</h2>
			<p class="text-sm text-ink-mute mt-2 leading-relaxed">{{ doctor.name }} — {{ selectedDateLabel }}, {{ selectedTime }}</p>
			<div class="flex gap-3 mt-6 justify-center">
				<NuxtLink to="/profile" class="text-sm font-bold text-white bg-main px-6 py-3 rounded-xl">Yozuvlarimni ko'rish</NuxtLink>
				<NuxtLink to="/" class="text-sm font-bold text-ink bg-surface px-6 py-3 rounded-xl">Bosh sahifa</NuxtLink>
			</div>
		</div>

		<div v-else class="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_320px] gap-6 items-start">
			<!-- doctor summary -->
			<div class="bg-surface border border-line-soft rounded-3xl p-7">
				<div class="flex gap-4 items-center">
					<div class="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-extrabold" style="background: linear-gradient(135deg,#E0F2FE,#D1FAE5); color:#0369A1">{{ doctor.name.replace(/^Dr\.\s*/, '').split(' ').map(w => w[0]).join('').toUpperCase() }}</div>
					<div><div class="text-base font-extrabold">{{ doctor.name }}</div><div class="text-xs text-ink-mute mt-0.5">{{ doctor.specialty }} · {{ doctor.rating.toFixed(1) }} ★</div></div>
				</div>
				<div class="h-px bg-line-soft my-5" />
				<template v-if="services.length">
					<div class="text-xs font-bold text-ink-soft mb-3">Xizmatni tanlang</div>
					<div class="flex flex-col gap-2">
						<button
							v-for="s in services" :key="s.id" type="button"
							class="flex justify-between items-center bg-card rounded-2xl px-4 py-3 cursor-pointer text-left"
							:class="s.id === selectedServiceId ? 'border-2 border-brand-sky' : 'border-[1.5px] border-line'"
							@click="selectedServiceId = s.id"
						>
							<span class="text-sm font-bold" :class="s.id === selectedServiceId ? '' : 'text-ink-soft font-semibold'">{{ s.name }}</span>
							<span class="text-sm font-extrabold" :class="s.id === selectedServiceId ? '' : 'text-ink-mute'">{{ s.price.toLocaleString('ru-RU') }}</span>
						</button>
					</div>
				</template>
				<div class="flex items-center gap-2 mt-5 text-xs text-ink-soft"><UIcon name="tabler:map-pin" class="text-sm" />{{ doctor.clinic.name }} · {{ doctor.branch.name }}</div>
			</div>

			<!-- calendar -->
			<div class="bg-card border border-line rounded-3xl p-7">
				<div class="flex justify-between items-center mb-5">
					<div class="text-base font-extrabold">{{ monthLabel }}</div>
					<div class="flex gap-2">
						<button type="button" class="w-11 h-11 rounded-xl bg-surface flex items-center justify-center cursor-pointer" @click="prevMonth"><UIcon name="tabler:chevron-left" class="text-base" /></button>
						<button type="button" class="w-11 h-11 rounded-xl bg-surface flex items-center justify-center cursor-pointer" @click="nextMonth"><UIcon name="tabler:chevron-right" class="text-base" /></button>
					</div>
				</div>
				<div class="grid grid-cols-7 gap-2 text-center">
					<div v-for="d in weekDow" :key="d" class="text-xs font-semibold text-ink-mute py-1">{{ d }}</div>
					<button
						v-for="(d, i) in calendarDays" :key="i" type="button" :disabled="!d.date || d.disabled"
						class="aspect-square flex items-center justify-center text-sm font-semibold rounded-xl"
						:class="d.date && d.date.getTime() === selectedDate.getTime() ? 'bg-main text-white cursor-pointer' : d.disabled ? 'text-line cursor-default' : d.date ? 'text-ink cursor-pointer hover:bg-surface' : ''"
						@click="d.date && !d.disabled && selectDay(d.date)"
					>{{ d.date?.getDate() ?? '' }}</button>
				</div>
			</div>

			<!-- times + summary -->
			<div class="flex flex-col gap-5">
				<div class="bg-card border border-line rounded-3xl p-7">
					<div class="text-base font-extrabold mb-4">{{ selectedDateLabel }}</div>
					<div v-if="isLoadingSlots" class="text-sm text-ink-mute py-4 text-center">Yuklanmoqda…</div>
					<div v-else-if="!slots.length" class="text-sm text-ink-mute py-4 text-center">Bu kunga bo'sh vaqt yo'q</div>
					<div v-else class="grid grid-cols-3 gap-2">
						<button
							v-for="s in slots" :key="s.time" type="button" :disabled="!s.available"
							class="text-center text-sm font-bold min-h-11 flex items-center justify-center rounded-xl"
							:class="!s.available ? 'text-line bg-surface/50 cursor-not-allowed line-through' : selectedTime === s.time ? 'text-white bg-main cursor-pointer' : 'text-ink bg-surface cursor-pointer hover:bg-line-soft'"
							@click="selectedTime = s.time"
						>{{ s.time }}</button>
					</div>
				</div>
				<div class="bg-brand-sky-light dark:bg-surface border border-brand-sky-border rounded-3xl p-6">
					<template v-if="selectedService">
						<div class="flex justify-between text-base font-extrabold"><span>{{ selectedService.name }}</span><span>{{ selectedService.price.toLocaleString('ru-RU') }} so'm</span></div>
					</template>
					<p v-if="bookingError" class="text-xs font-semibold text-red-600 mt-3">{{ bookingError }}</p>
					<button type="button" :disabled="isBooking || !selectedTime" class="w-full border-0 cursor-pointer font-bold text-base text-white bg-main py-4 rounded-2xl mt-5 shadow-lg disabled:opacity-60" @click="submitBooking">
						{{ isBooking ? 'Yuborilmoqda…' : selectedTime ? `Band qilish · ${selectedTime}` : 'Vaqtni tanlang' }}
					</button>
					<div class="text-xs text-ink-mute text-center mt-3">{{ $t('cn.common.cancelFree') }}</div>
				</div>
			</div>
		</div>
		</div>

		<CareNowFooter />
	</main>
</template>
