import Service from '~/service/Service'

export interface AvailabilitySlot { time: string; available: boolean }

interface BookingClinic { id: string; slug: string; name: string }
interface BookingBranch { id: string; name: string; address: string }
interface BookingDoctor { id: string; name: string; specialty: string; clinic: BookingClinic; branch: BookingBranch }

export interface ApiBooking {
	id: string
	doctorId: string
	date: string
	time: string
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
	doctor: BookingDoctor
}

export function useBookingApi() {
	const { locale } = useI18n()
	const token = useToken()

	async function fetchAvailability(doctorId: string, date: string) {
		const res = await Service.get<AvailabilitySlot[]>(`/doctors/${doctorId}/availability?date=${date}`, locale.value)
		return res.success && res.data ? res.data : []
	}

	async function createBooking(input: { doctorId: string; date: string; time: string; serviceId?: string }) {
		return Service.post<ApiBooking, typeof input>('/bookings', locale.value, input, token.value)
	}

	async function fetchMyBookings() {
		const res = await Service.get<ApiBooking[]>('/bookings/me', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function cancelBooking(id: string) {
		return Service.delete<ApiBooking>(`/bookings/${id}`, locale.value, token.value)
	}

	return { fetchAvailability, createBooking, fetchMyBookings, cancelBooking }
}
