import Service from '~/service/Service'

export interface AdminBranch { id: string; clinicId: string; name: string; address: string; phone: string; lat: number; lng: number }
export interface AdminDoctor { id: string; clinicId: string; branchId: string; name: string; specialty: string; experienceYrs: number; rating: number; reviewsCount: number }
export interface AdminClinic { id: string; slug: string; name: string; desc: string | null; rating: number; is247: boolean; ownerId: string | null; branches: AdminBranch[]; doctors: AdminDoctor[] }

export interface AdminAvailabilitySlot { id: string; doctorId: string; dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }

interface AdminBookingPatient { id: string; phone: string | null; name: string | null }
export interface AdminBooking { id: string; doctorId: string; date: string; time: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; doctor: AdminDoctor; patient: AdminBookingPatient }

export function useClinicAdminApi() {
	const { locale } = useI18n()
	const token = useToken()

	async function fetchMyClinic() {
		const res = await Service.get<AdminClinic>('/admin/clinic', locale.value, token.value)
		return res.success ? res.data : null
	}

	async function addDoctor(input: { branchId: string; name: string; specialty: string; experienceYrs: number }) {
		return Service.post<AdminDoctor, typeof input>('/admin/clinic/doctors', locale.value, input, token.value)
	}

	async function updateDoctor(id: string, input: Partial<{ branchId: string; name: string; specialty: string; experienceYrs: number }>) {
		return Service.patch<AdminDoctor, typeof input>(`/admin/clinic/doctors/${id}`, locale.value, input, token.value)
	}

	async function removeDoctor(id: string) {
		return Service.delete<{ removed: boolean }>(`/admin/clinic/doctors/${id}`, locale.value, token.value)
	}

	async function fetchAvailability(doctorId: string) {
		const res = await Service.get<AdminAvailabilitySlot[]>(`/admin/clinic/doctors/${doctorId}/availability`, locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function setAvailability(doctorId: string, slots: { dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }[]) {
		return Service.post<AdminAvailabilitySlot[], { slots: typeof slots }>(`/admin/clinic/doctors/${doctorId}/availability`, locale.value, { slots }, token.value)
	}

	async function fetchMyBookings() {
		const res = await Service.get<AdminBooking[]>('/admin/clinic/bookings', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	return { fetchMyClinic, addDoctor, updateDoctor, removeDoctor, fetchAvailability, setAvailability, fetchMyBookings }
}
