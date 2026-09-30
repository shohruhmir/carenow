// Loads the Yandex Maps JS API (v2.1) once and resolves with the global `ymaps`
// object. Safe to call from multiple components — the script tag and the
// ymaps.ready() call each only happen once, subsequent callers reuse the
// same promise.

declare global {
	interface Window {
		ymaps?: any
	}
}

let loadPromise: Promise<any> | null = null

export function useYandexMaps() {
	const config = useRuntimeConfig()
	const apiKey = config.public.yandexMapsApiKey as string

	function load(): Promise<any> {
		if (loadPromise) return loadPromise

		loadPromise = new Promise((resolve, reject) => {
			if (!apiKey) {
				reject(new Error('NO_API_KEY'))
				return
			}
			if (window.ymaps) {
				window.ymaps.ready(() => resolve(window.ymaps))
				return
			}

			const script = document.createElement('script')
			script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`
			script.async = true
			script.onload = () => {
				window.ymaps!.ready(() => resolve(window.ymaps))
			}
			script.onerror = () => reject(new Error('SCRIPT_LOAD_FAILED'))
			document.head.appendChild(script)
		})

		return loadPromise
	}

	return { load, hasApiKey: !!apiKey }
}
