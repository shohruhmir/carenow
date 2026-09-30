import Service from '~/service/Service'

export interface PlatformStats { clinics: number; branches: number; doctors: number; bookings: number; leads: number; patients: number; clinicAdmins: number }

interface AdminOwner { id: string; phone: string; name: string | null }
export interface AdminBranchRow { id: string; clinicId: string; name: string; address: string; phone: string; lat: number; lng: number }
export interface AdminClinicRow { id: string; slug: string; name: string; desc: string | null; rating: number; is247: boolean; owner: AdminOwner | null; branches: AdminBranchRow[]; _count: { branches: number; doctors: number } }

export interface AdminLead { id: string; clinicName: string; city: string; branchCount: string; phone: string; createdAt: string }

export interface AdminUserRow { id: string; phone: string | null; name: string | null; role: 'PATIENT' | 'CLINIC_ADMIN' | 'DOCTOR' | 'SUPER_ADMIN'; createdAt: string }

interface AdminServiceClinic { id: string; name: string }
export interface AdminServiceRow { id: string; clinicId: string; name: string; price: number; clinic: AdminServiceClinic }

interface AdminDoctorRef { id: string; name: string }
export interface AdminDoctorRow { id: string; clinicId: string; branchId: string; name: string; specialty: string; experienceYrs: number; clinic: AdminDoctorRef; branch: AdminDoctorRef }

export type AdminBookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
interface AdminBookingPatient { id: string; phone: string | null; name: string | null }
interface AdminBookingDoctor { id: string; name: string; clinic: { id: string; name: string } }
export interface AdminBookingRow { id: string; patientId: string; doctorId: string; serviceId: string | null; date: string; time: string; status: AdminBookingStatus; patient: AdminBookingPatient; doctor: AdminBookingDoctor }

export interface AdminContentRow { id: string; key: string; label: string; uz: string; ru: string; en: string; updatedAt: string }

export function useSuperAdminApi() {
	const { locale } = useI18n()
	const token = useToken()

	async function fetchStats() {
		const res = await Service.get<PlatformStats>('/super-admin/stats', locale.value, token.value)
		return res.success ? res.data : null
	}

	async function fetchClinics() {
		const res = await Service.get<AdminClinicRow[]>('/super-admin/clinics', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function assignClinicOwner(clinicId: string, phone: string) {
		return Service.patch<AdminClinicRow, { phone: string }>(`/super-admin/clinics/${clinicId}/owner`, locale.value, { phone }, token.value)
	}

	async function createClinic(input: { slug: string; name: string; desc?: string; is247?: boolean }) {
		return Service.post<AdminClinicRow, typeof input>('/super-admin/clinics', locale.value, input, token.value)
	}

	async function updateClinic(id: string, input: Partial<{ slug: string; name: string; desc: string; is247: boolean }>) {
		return Service.patch<AdminClinicRow, typeof input>(`/super-admin/clinics/${id}`, locale.value, input, token.value)
	}

	async function removeClinic(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/clinics/${id}`, locale.value, token.value)
	}

	async function createBranch(clinicId: string, input: { name: string; address: string; phone: string; lat: number; lng: number }) {
		return Service.post<AdminBranchRow, typeof input>(`/super-admin/clinics/${clinicId}/branches`, locale.value, input, token.value)
	}

	async function updateBranch(id: string, input: Partial<{ name: string; address: string; phone: string; lat: number; lng: number }>) {
		return Service.patch<AdminBranchRow, typeof input>(`/super-admin/branches/${id}`, locale.value, input, token.value)
	}

	async function removeBranch(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/branches/${id}`, locale.value, token.value)
	}

	async function fetchLeads() {
		const res = await Service.get<AdminLead[]>('/super-admin/leads', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function removeLead(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/leads/${id}`, locale.value, token.value)
	}

	async function fetchUsers() {
		const res = await Service.get<AdminUserRow[]>('/super-admin/users', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function updateUser(id: string, input: { name: string }) {
		return Service.patch<AdminUserRow, typeof input>(`/super-admin/users/${id}`, locale.value, input, token.value)
	}

	async function removeUser(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/users/${id}`, locale.value, token.value)
	}

	async function fetchServices() {
		const res = await Service.get<AdminServiceRow[]>('/super-admin/services', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function createService(input: { clinicId: string; name: string; price: number }) {
		return Service.post<AdminServiceRow, typeof input>('/super-admin/services', locale.value, input, token.value)
	}

	async function updateService(id: string, input: Partial<{ clinicId: string; name: string; price: number }>) {
		return Service.patch<AdminServiceRow, typeof input>(`/super-admin/services/${id}`, locale.value, input, token.value)
	}

	async function removeService(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/services/${id}`, locale.value, token.value)
	}

	async function fetchDoctors() {
		const res = await Service.get<AdminDoctorRow[]>('/super-admin/doctors', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function createDoctor(input: { clinicId: string; branchId: string; name: string; specialty: string; experienceYrs: number }) {
		return Service.post<AdminDoctorRow, typeof input>('/super-admin/doctors', locale.value, input, token.value)
	}

	async function updateDoctor(id: string, input: Partial<{ clinicId: string; branchId: string; name: string; specialty: string; experienceYrs: number }>) {
		return Service.patch<AdminDoctorRow, typeof input>(`/super-admin/doctors/${id}`, locale.value, input, token.value)
	}

	async function removeDoctor(id: string) {
		return Service.delete<{ removed: boolean }>(`/super-admin/doctors/${id}`, locale.value, token.value)
	}

	async function fetchBookings() {
		const res = await Service.get<AdminBookingRow[]>('/super-admin/bookings', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function updateBookingStatus(id: string, status: AdminBookingStatus) {
		return Service.patch<AdminBookingRow, { status: AdminBookingStatus }>(`/super-admin/bookings/${id}/status`, locale.value, { status }, token.value)
	}

	async function fetchContent() {
		const res = await Service.get<AdminContentRow[]>('/super-admin/content', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function updateContent(id: string, input: Partial<{ uz: string; ru: string; en: string }>) {
		return Service.patch<AdminContentRow, typeof input>(`/super-admin/content/${id}`, locale.value, input, token.value)
	}

	return {
		fetchStats,
		fetchClinics,
		assignClinicOwner,
		createClinic,
		updateClinic,
		removeClinic,
		createBranch,
		updateBranch,
		removeBranch,
		fetchLeads,
		removeLead,
		fetchUsers,
		updateUser,
		removeUser,
		fetchServices,
		createService,
		updateService,
		removeService,
		fetchDoctors,
		createDoctor,
		updateDoctor,
		removeDoctor,
		fetchBookings,
		updateBookingStatus,
		fetchContent,
		updateContent,
	}
}
