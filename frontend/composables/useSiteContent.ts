export interface SiteContentValue { uz: string; ru: string; en: string }

// The actual fetch lives in plugins/site-content.ts, not here — that plugin
// intentionally avoids useI18n() (calling it outside a component setup
// context throws "Must be called at the top of a setup function"). This
// composable only reads the shared useState map it's fetched into, so it's
// safe to call from any page/component <script setup>. Every call site
// passes its own current hardcoded string as `fallback` so a missing key,
// an unresolved fetch, or a failed request never blanks the page.
export function useSiteContent() {
	const { locale } = useI18n()
	const content = useState<Record<string, SiteContentValue>>('site-content-map', () => ({}))

	function t(key: string, fallback: string): string {
		const row = content.value[key]
		if (!row) return fallback
		const current = row[locale.value as 'uz' | 'ru' | 'en']
		return current || row.uz || fallback
	}

	return { t }
}
