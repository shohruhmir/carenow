// Loads the Google Identity Services script once and exposes a popup
// OAuth2 "token client" flow. Mirrors useYandexMaps.ts's load-once pattern.
// We request an access token (not an ID token) because the backend verifies
// identity by handing the token straight back to Google's userinfo endpoint
// — see backend/src/auth/auth.service.ts's googleLogin().

declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initTokenClient: (config: {
						client_id: string
						scope: string
						callback: (res: { access_token?: string; error?: string }) => void
					}) => { requestAccessToken: () => void }
				}
			}
		}
	}
}

let loadPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
	if (loadPromise) return loadPromise

	loadPromise = new Promise((resolve, reject) => {
		if (window.google?.accounts?.oauth2) {
			resolve()
			return
		}

		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.async = true
		script.defer = true
		script.onload = () => resolve()
		script.onerror = () => reject(new Error('SCRIPT_LOAD_FAILED'))
		document.head.appendChild(script)
	})

	return loadPromise
}

interface TokenClient { requestAccessToken: () => void }

// Module-level (not per-component) so the client survives across a page's
// mount/unmount and doesn't need re-initializing every time useGoogleAuth()
// is called.
let tokenClient: TokenClient | null = null
let pendingCallback: ((res: { access_token?: string; error?: string }) => void) | null = null

export function useGoogleAuth() {
	const config = useRuntimeConfig()
	const clientId = config.public.googleClientId as string
	const isReady = ref(!!tokenClient)

	// Load the script and construct the token client ahead of time (e.g. on
	// page mount), NOT inside the click handler. Google's popup-based
	// requestAccessToken() must be called synchronously within a genuine user
	// gesture (the click) — any `await` between the click and that call (like
	// awaiting the script load) breaks the gesture chain, and Chrome silently
	// blocks or Google's SDK falls back to a broken redirect flow instead of
	// the popup. Preloading here keeps the click handler's call synchronous.
	async function preload(): Promise<void> {
		if (!clientId || tokenClient) return
		await loadScript()
		tokenClient = window.google!.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: 'openid email profile',
			callback: (res) => pendingCallback?.(res),
		})
		isReady.value = true
	}

	function requestAccessToken(): Promise<string> {
		if (!clientId) return Promise.reject(new Error('NO_CLIENT_ID'))
		if (!tokenClient) return Promise.reject(new Error('NOT_READY'))

		return new Promise((resolve, reject) => {
			pendingCallback = (res) => {
				pendingCallback = null
				if (res.access_token) resolve(res.access_token)
				else reject(new Error(res.error || 'NO_ACCESS_TOKEN'))
			}
			tokenClient!.requestAccessToken()
		})
	}

	return { preload, requestAccessToken, hasClientId: !!clientId, isReady }
}
