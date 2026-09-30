import Service from '~/service/Service'

interface FavoriteClinic { id: string; slug: string; name: string }
interface FavoriteBranch { id: string; name: string; address: string }
interface FavoriteDoctor { id: string; name: string; specialty: string; experienceYrs: number; rating: number; reviewsCount: number; clinic: FavoriteClinic; branch: FavoriteBranch }

export interface FavoriteRow { id: string; doctorId: string; createdAt: string; doctor: FavoriteDoctor }

export function useFavoritesApi() {
	const { locale } = useI18n()
	const token = useToken()

	async function fetchMyFavorites() {
		const res = await Service.get<FavoriteRow[]>('/favorites/me', locale.value, token.value)
		return res.success && res.data ? res.data : []
	}

	async function addFavorite(doctorId: string) {
		return Service.post<FavoriteRow, Record<string, never>>(`/favorites/${doctorId}`, locale.value, {}, token.value)
	}

	async function removeFavorite(doctorId: string) {
		return Service.delete<{ removed: boolean }>(`/favorites/${doctorId}`, locale.value, token.value)
	}

	return { fetchMyFavorites, addFavorite, removeFavorite }
}
