import Service from '~/service/Service'
import type { ClinicSummary, Branch } from '~/composables/useCareNowData'

export interface ApiBranch { id: string; name: string; address: string; phone: string; lat: number; lng: number }
// The list endpoint (GET /clinics) only sends { specialty } per doctor to
// keep the payload light; the detail endpoint (GET /clinics/:slug) sends the
// full shape. Only specialty is guaranteed present in both — kept optional
// otherwise so one type covers both responses.
export interface ApiClinicDoctor { id?: string; branchId?: string; name?: string; specialty: string; experienceYrs?: number; rating?: number; reviewsCount?: number }
export interface ApiService { id: string; name: string; price: number }
export interface ApiClinic {
	id: string
	slug: string
	name: string
	desc: string | null
	rating: number
	is247: boolean
	branches: ApiBranch[]
	doctors?: ApiClinicDoctor[]
	services?: ApiService[]
	_count?: { doctors: number }
}

const LOGO_PALETTE = [
	{ bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0EA5E9' },
	{ bg: 'linear-gradient(135deg,#EDE9FE,#E0F2FE)', fg: '#7C3AED' },
	{ bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#DB2777' },
]

function hashCode(str: string) {
	let hash = 0
	for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
	return Math.abs(hash)
}

function initials(name: string) {
	return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function mapBranch(b: ApiBranch): Branch {
	return { id: b.id, name: b.name, addr: b.address, hours: '', docs: 0, phone: b.phone, lat: b.lat, lng: b.lng }
}

// Badges/hours-text/review-count/distance don't exist as real fields yet
// (reviews need the deferred Review model, distance needs geolocation,
// clinic-level hours text isn't in the schema) — synthesized honestly from
// what IS real (is247, branch count) rather than fabricated.
export function mapApiClinicToSummary(c: ApiClinic): ClinicSummary {
	const palette = LOGO_PALETTE[hashCode(c.id) % LOGO_PALETTE.length]
	const badges: ClinicSummary['badges'] = []
	if (c.is247) badges.push({ label: '24/7 ochiq', kind: 'green' })
	if (c.branches.length > 1) badges.push({ label: `Tarmoq · ${c.branches.length} filial`, kind: 'blue' })
	if (c.doctors?.some((d) => d.specialty.toLowerCase().includes('bolalar'))) {
		badges.push({ label: 'Bolalar bo\'limi bor', kind: 'amber' })
	}

	return {
		id: c.id,
		slug: c.slug,
		logo: initials(c.name),
		logoBg: palette.bg,
		logoFg: palette.fg,
		name: c.name,
		rating: c.rating.toFixed(1),
		reviews: '0',
		docCount: c._count?.doctors ?? c.doctors?.length ?? 0,
		badges,
		desc: c.desc ?? '',
		dist: '',
		is247: c.is247,
		hoursLabel: c.is247 ? '' : 'Ish vaqtlari so\'rov bo\'yicha',
		weekly: null,
		branches: c.branches.map(mapBranch),
	}
}

export function useClinicsApi() {
	const { locale } = useI18n()

	async function fetchClinics(params: { is247?: boolean; q?: string } = {}) {
		const query = new URLSearchParams()
		if (params.is247 !== undefined) query.set('is247', String(params.is247))
		if (params.q) query.set('q', params.q)
		const qs = query.toString()

		const res = await Service.get<ApiClinic[]>(`/clinics${qs ? `?${qs}` : ''}`, locale.value)
		if (!res.success || !res.data) return []
		return res.data.map(mapApiClinicToSummary)
	}

	async function fetchClinic(slug: string) {
		const res = await Service.get<ApiClinic>(`/clinics/${slug}`, locale.value)
		return res.success && res.data ? mapApiClinicToSummary(res.data) : null
	}

	// Unmapped — for pages that need real relational fields ClinicSummary
	// flattens away, e.g. the booking page needs clinic.services with ids.
	async function fetchClinicRaw(slug: string) {
		const res = await Service.get<ApiClinic>(`/clinics/${slug}`, locale.value)
		return res.success ? res.data : null
	}

	// GET /clinics (list) doesn't include services — services are only on the
	// detail response — so building a platform-wide price catalog means
	// fetching each clinic's detail. Fine at this scale (a handful of
	// clinics); would need a dedicated backend aggregation endpoint if the
	// clinic count grows large enough for N+1 to matter.
	async function fetchServiceCatalog() {
		const list = await fetchClinics()
		const details = await Promise.all(list.map((c) => fetchClinicRaw(c.slug)))

		const byName = new Map<string, { prices: number[]; clinicIds: Set<string> }>()
		for (const clinic of details) {
			if (!clinic?.services) continue
			for (const s of clinic.services) {
				const entry = byName.get(s.name) ?? { prices: [], clinicIds: new Set<string>() }
				entry.prices.push(s.price)
				entry.clinicIds.add(clinic.id)
				byName.set(s.name, entry)
			}
		}

		return [...byName.entries()]
			.map(([name, e]) => ({ name, minPrice: Math.min(...e.prices), maxPrice: Math.max(...e.prices), clinicCount: e.clinicIds.size }))
			.sort((a, b) => a.minPrice - b.minPrice)
	}

	return { fetchClinics, fetchClinic, fetchClinicRaw, fetchServiceCatalog }
}
