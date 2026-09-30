import Service from '~/service/Service'

interface PortalClinic { id: string; slug: string; name: string; rating: number }
interface PortalBranch { id: string; name: string; address: string; phone: string }

export interface DoctorPortalProfile {
	id: string
	name: string
	specialty: string
	experienceYrs: number
	rating: number
	reviewsCount: number
	clinic: PortalClinic
	branch: PortalBranch
}

export interface PortalAvailabilitySlot { id: string; doctorId: string; dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }

interface PortalPatient { id: string; phone: string | null; name: string | null }
export interface PortalBooking { id: string; date: string; time: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; patient: PortalPatient }

export function useDoctorPortalApi() {
	const { locale } = useI18n()
	const token = useToken()

	async function fetchMyProfile() {
		const res = await Service.get<DoctorPortalProfile>('/doctor-portal/me', locale.value, token.value)
		return res.success ? res.data : null
	}

	async function fetchMyAvailability() {
		const res = await Service.get<PortalAvailabilitySlot[]>('/doctor-portal/availability', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function setMyAvailability(slots: { dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }[]) {
		return Service.post<PortalAvailabilitySlot[], { slots: typeof slots }>('/doctor-portal/availability', locale.value, { slots }, token.value)
	}

	async function fetchMyBookings() {
		const res = await Service.get<PortalBooking[]>('/doctor-portal/bookings', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	return { fetchMyProfile, fetchMyAvailability, setMyAvailability, fetchMyBookings }
}
