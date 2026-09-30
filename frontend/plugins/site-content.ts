import Service from '~/service/Service'
import type { SiteContentValue } from '~/composables/useSiteContent'

// Fires the site-content fetch on app boot without awaiting it — this app is
// ssr:false, so an awaited plugin blocks app.vue from mounting on every hard
// page load. Kept locale-independent on purpose: calling useI18n() here
// throws ("Must be called at the top of a setup function") since a plugin
// runs outside a component setup context — locale-aware resolution happens
// later, in useSiteContent().t(), which is only ever called from real page
// <script setup> blocks. Components render instantly with their fallback
// text and reactively swap in the fetched translation once this resolves.
export default defineNuxtPlugin(() => {
	const content = useState<Record<string, SiteContentValue>>('site-content-map', () => ({}))
	const loaded = useState('site-content-loaded', () => false)
	if (loaded.value) return
	loaded.value = true

	Service.get<Record<string, SiteContentValue>>('/site-content', 'uz').then((res) => {
		if (res.success && res.data) content.value = res.data
	})
})
