export const cities = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona", 'Nukus', 'Qarshi']

export const CITY_STORAGE_KEY = 'carenow_city'

export function useCity() {
	return useState<string>('carenow-city', () => cities[0])
}

export function useCityModal() {
	return useState<boolean>('carenow-city-modal-open', () => false)
}
