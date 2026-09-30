import Service from '~/service/Service'

export interface AuthUser {
	id: string
	phone: string | null
	name: string | null
	role: 'PATIENT' | 'CLINIC_ADMIN' | 'DOCTOR' | 'SUPER_ADMIN'
	createdAt: string
}

interface RequestOtpResponse { phone: string; expiresInSeconds: number; devCode?: string }
interface VerifyOtpResponse { token: string; user: AuthUser }

export function useAuth() {
	const { locale } = useI18n()
	const token = useToken()

	async function requestOtp(phone: string) {
		return Service.post<RequestOtpResponse, { phone: string }>('/auth/otp/request', locale.value, { phone })
	}

	async function verifyOtp(phone: string, code: string) {
		const res = await Service.post<VerifyOtpResponse, { phone: string; code: string }>('/auth/otp/verify', locale.value, { phone, code })
		if (res.success && res.data) {
			token.value = res.data.token
		}
		return res
	}

	async function adminLogin(username: string, password: string) {
		const res = await Service.post<VerifyOtpResponse, { username: string; password: string }>('/auth/admin-login', locale.value, { username, password })
		if (res.success && res.data) {
			token.value = res.data.token
		}
		return res
	}

	async function googleLogin(accessToken: string) {
		const res = await Service.post<VerifyOtpResponse, { accessToken: string }>('/auth/google', locale.value, { accessToken })
		if (res.success && res.data) {
			token.value = res.data.token
		}
		return res
	}

	async function fetchMe() {
		if (!token.value) return null
		const res = await Service.get<AuthUser>('/auth/me', locale.value, token.value)
		return res.success ? res.data : null
	}

	async function updateProfile(name: string) {
		return Service.patch<AuthUser, { name: string }>('/auth/me', locale.value, { name }, token.value)
	}

	function logout() {
		token.value = null
	}

	return { requestOtp, verifyOtp, adminLogin, googleLogin, fetchMe, updateProfile, logout }
}
