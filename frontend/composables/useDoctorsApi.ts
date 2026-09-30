import Service from '~/service/Service'
import type { DoctorSummary } from '~/composables/useCareNowData'

// Prefixed to avoid colliding with useClinicsApi.ts's richer ApiClinic/
// ApiBranch (Nuxt auto-imports every composable file's exports globally by
// name, so two files exporting the same type name causes one to silently
// shadow the other — this only needs the narrow subset a doctor card cares
// about, not the full clinic/branch shape).
export interface DoctorApiClinic { id: string; slug: string; name: string; rating: number }
export interface DoctorApiBranch { id: string; name: string; address: string }
export interface ApiDoctor {
	id: string
	name: string
	specialty: string
	experienceYrs: number
	rating: number
	reviewsCount: number
	clinic: DoctorApiClinic
	branch: DoctorApiBranch
}

const AVATAR_PALETTE = [
	{ bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0369A1' },
	{ bg: 'linear-gradient(135deg,#EDE9FE,#E0F2FE)', fg: '#7C3AED' },
	{ bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#DB2777' },
	{ bg: 'linear-gradient(135deg,#D1FAE5,#E0F2FE)', fg: '#047857' },
]

function hashCode(str: string) {
	let hash = 0
	for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
	return Math.abs(hash)
}

function initials(name: string) {
	return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// Real doctors don't have per-doctor pricing (Service is clinic-level) or
// precomputed "today's slots" (that needs a date param) yet — surfacing an
// honest "price on request" / empty slots beats fabricating numbers.
export function mapApiDoctorToSummary(d: ApiDoctor): DoctorSummary {
	const palette = AVATAR_PALETTE[hashCode(d.id) % AVATAR_PALETTE.length]
	return {
		id: d.id,
		init: initials(d.name),
		bg: palette.bg,
		fg: palette.fg,
		name: d.name,
		spec: d.specialty,
		exp: `${d.experienceYrs} yil staj`,
		rating: d.rating.toFixed(1),
		reviews: d.reviewsCount,
		clinic: d.clinic.name,
		addr: d.branch.address,
		slots: [],
		price: "narx so'rov bo'yicha",
	}
}

export function useDoctorsApi() {
	const { locale } = useI18n()

	async function fetchDoctors(params: { specialty?: string; q?: string } = {}) {
		const query = new URLSearchParams()
		if (params.specialty) query.set('specialty', params.specialty)
		if (params.q) query.set('q', params.q)
		const qs = query.toString()

		const res = await Service.get<ApiDoctor[]>(`/doctors${qs ? `?${qs}` : ''}`, locale.value)
		if (!res.success || !res.data) return []
		return res.data.map(mapApiDoctorToSummary)
	}

	async function fetchDoctor(id: string) {
		const res = await Service.get<ApiDoctor>(`/doctors/${id}`, locale.value)
		return res.success && res.data ? mapApiDoctorToSummary(res.data) : null
	}

	// Unmapped, for pages that need the real relational fields
	// (clinic.slug/id, branch.address) that DoctorSummary flattens away —
	// e.g. the booking page, which needs the clinic slug to fetch services.
	async function fetchDoctorRaw(id: string) {
		const res = await Service.get<ApiDoctor>(`/doctors/${id}`, locale.value)
		return res.success ? res.data : null
	}

	return { fetchDoctors, fetchDoctor, fetchDoctorRaw }
}
