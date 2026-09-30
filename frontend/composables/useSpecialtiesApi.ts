import type { DoctorSummary } from '~/composables/useDoctorsApi'

export interface SpecCategory {
	emoji: string
	name: string
	count: number
	bg: string
}

// Specialty isn't a backend model (just a free-text field on Doctor), so
// emoji/color are a cosmetic-only local lookup — the set of specialties and
// their counts come from real doctors. Shared between the homepage and
// /services so both derive it the same way instead of duplicating counting
// logic (and, for the homepage, so it doesn't cost a second /doctors fetch).
const SPECIALTY_META: Record<string, { emoji: string; bg: string }> = {
	'Terapevt-stomatolog': { emoji: '🦷', bg: '#E0F2FE' },
	'Ortodont': { emoji: '😁', bg: '#D1FAE5' },
	'Implantolog': { emoji: '🔩', bg: '#EDE9FE' },
	'Bolalar stomatologi': { emoji: '🧸', bg: '#FCE7F3' },
	'Jarroh-stomatolog': { emoji: '⚕️', bg: '#FEE2E2' },
	'Gigienist': { emoji: '🪥', bg: '#FEF3C7' },
	'Parodontolog': { emoji: '🫧', bg: '#E0F2FE' },
	'Ortoped (protez)': { emoji: '👑', bg: '#D1FAE5' },
}
const DEFAULT_SPEC_META = { emoji: '🦷', bg: '#E0F2FE' }

export function aggregateSpecialties(doctors: DoctorSummary[]): SpecCategory[] {
	const counts = new Map<string, number>()
	for (const d of doctors) counts.set(d.spec, (counts.get(d.spec) ?? 0) + 1)
	return [...counts.entries()]
		.map(([name, count]) => ({ name, count, ...(SPECIALTY_META[name] ?? DEFAULT_SPEC_META) }))
		.sort((a, b) => b.count - a.count)
}

export function useSpecialtiesApi() {
	const { fetchDoctors } = useDoctorsApi()

	async function fetchSpecialties() {
		return aggregateSpecialties(await fetchDoctors())
	}

	return { fetchSpecialties }
}
