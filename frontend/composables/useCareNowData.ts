// Static mock data for the CareNow marketplace UI.
// No backend exists yet for this domain — see service/urls.ts (restaurant-template leftover).
// Shapes mirror the CareNow Web design spec so components can bind directly.

export interface Slot {
	label: string
	active?: boolean
}

export interface DoctorSummary {
	id: number | string
	init: string
	bg: string
	fg: string
	name: string
	spec: string
	exp: string
	rating: string
	reviews: number
	clinic: string
	addr?: string
	slots: Slot[]
	oldPrice?: string
	price: string
	disc?: string
	promo?: boolean
	top?: boolean
	kids?: boolean
}

export interface Branch {
	id: number | string
	name: string
	addr: string
	hours: string
	docs: number
	phone: string
	lat: number
	lng: number
}

export interface ClinicBadge {
	label: string
	kind: 'blue' | 'amber' | 'green'
}

export interface ClinicSummary {
	id: number | string
	slug: string
	logo: string
	logoBg: string
	logoFg: string
	name: string
	rating: string
	reviews: string
	docCount: number
	badges: ClinicBadge[]
	desc: string
	dist: string
	is247: boolean
	hoursLabel: string
	weekly: { d: string; h: string }[] | null
	branches: Branch[]
}

export interface SpecCategory {
	emoji: string
	name: string
	count: number
	bg: string
}

export interface ServiceRow {
	emoji: string
	name: string
	price: string
	docs: number
}

export interface Review {
	init: string
	bg: string
	fg: string
	name: string
	date: string
	service?: string
	stars: string
	text: string
}

const badgeKindClass: Record<ClinicBadge['kind'], { fg: string; bg: string }> = {
	blue: { fg: '#0369A1', bg: '#E0F2FE' },
	amber: { fg: '#B45309', bg: '#FEF3C7' },
	green: { fg: '#047857', bg: '#D1FAE5' },
}

export function badgeColor(kind: ClinicBadge['kind']) {
	return badgeKindClass[kind]
}

export const specs: SpecCategory[] = [
	{ emoji: '🦷', name: 'Terapevt-stomatolog', count: 412, bg: '#E0F2FE' },
	{ emoji: '😁', name: 'Ortodont', count: 186, bg: '#D1FAE5' },
	{ emoji: '🔩', name: 'Implantolog', count: 143, bg: '#EDE9FE' },
	{ emoji: '🧸', name: 'Bolalar stomatologi', count: 207, bg: '#FCE7F3' },
	{ emoji: '⚕️', name: 'Jarroh-stomatolog', count: 158, bg: '#FEE2E2' },
	{ emoji: '🪥', name: 'Gigienist', count: 96, bg: '#FEF3C7' },
	{ emoji: '🫧', name: 'Parodontolog', count: 74, bg: '#E0F2FE' },
	{ emoji: '👑', name: 'Ortoped (protez)', count: 121, bg: '#D1FAE5' },
]

export const popularSearches = ['Implant', "Breket o'rnatish", 'Professional tozalash', 'Plomba', 'Bolalar stomatologiyasi', 'Oqartirish']

export const topDoctors: DoctorSummary[] = [
	{ id: 1, init: 'AK', bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0369A1', name: 'Dr. Aziza Karimova', spec: 'Ortodont', exp: '12 yil staj', rating: '4.9', reviews: 312, clinic: 'Smile Dental · Chilonzor', slots: [{ label: '14:30' }, { label: '15:00' }, { label: '17:30' }], oldPrice: '300 000', price: "250 000 so'm", disc: '−17%' },
	{ id: 2, init: 'RS', bg: 'linear-gradient(135deg,#EDE9FE,#E0F2FE)', fg: '#7C3AED', name: 'Dr. Rustam Saidov', spec: 'Implantolog', exp: '15 yil staj', rating: '4.8', reviews: 204, clinic: 'Dent Pro · Yunusobod', slots: [{ label: '10:00' }, { label: '11:30' }, { label: '16:00' }], oldPrice: '500 000', price: "400 000 so'm", disc: '−20%' },
	{ id: 3, init: 'MT', bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#DB2777', name: 'Dr. Malika Tosheva', spec: 'Bolalar stomatologi', exp: '9 yil staj', rating: '4.9', reviews: 178, clinic: "KidsDent · Mirzo Ulug'bek", slots: [{ label: '09:30' }, { label: '13:00' }, { label: '15:30' }], oldPrice: '180 000', price: "150 000 so'm", disc: '−17%' },
]

export const searchResults: DoctorSummary[] = [
	{ id: 1, promo: true, init: 'AK', bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0369A1', name: 'Dr. Aziza Karimova', spec: 'Ortodont · oliy toifali shifokor', exp: '12 yil', rating: '4.9', reviews: 312, clinic: 'Smile Dental Center', addr: "Bunyodkor ko'ch. 27, Chilonzor", slots: [{ label: '14:30', active: true }, { label: '15:00' }, { label: '16:30' }, { label: '17:30' }, { label: '18:00' }], oldPrice: "300 000 so'm", price: "250 000 so'm", disc: '−17%' },
	{ id: 2, promo: false, init: 'JU', bg: 'linear-gradient(135deg,#D1FAE5,#E0F2FE)', fg: '#047857', name: 'Dr. Jahongir Umarov', spec: 'Ortodont', exp: '8 yil', rating: '4.7', reviews: 143, clinic: 'OrthoLine Clinic', addr: "Amir Temur shoh ko'ch. 88, Yunusobod", slots: [{ label: '11:00' }, { label: '12:30' }, { label: '15:00' }], oldPrice: "220 000 so'm", price: "180 000 so'm", disc: '−18%' },
	{ id: 3, promo: false, init: 'NB', bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#DB2777', name: 'Dr. Nilufar Bekova', spec: "Ortodont · bolalar bilan ishlaydi", exp: '11 yil', rating: '4.8', reviews: 196, clinic: 'Family Dental Clinic', addr: "Qatortol ko'ch. 4, Chilonzor", slots: [{ label: '09:00' }, { label: '10:30' }, { label: '14:00' }, { label: '16:00' }], oldPrice: '', price: "320 000 so'm", disc: '−10%' },
]

const weeklyPattern = (h: string, sun?: string) => ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d, i) => ({ d, h: i === 6 && sun ? sun : h }))

export const clinics: ClinicSummary[] = [
	{
		id: 1, slug: 'smile-dental', logo: 'SD', logoBg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', logoFg: '#0EA5E9',
		name: 'Smile Dental Network', rating: '4.9', reviews: '3 512', docCount: 64,
		badges: [{ label: 'Tarmoq · 7 filial', kind: 'blue' }, { label: "Bolalar bo'limi", kind: 'amber' }, { label: 'Implantatsiya markazi', kind: 'green' }],
		desc: "2015-yildan beri ishlaydigan ko'p tarmoqli stomatologiya tarmog'i. Implantatsiya, ortodontiya va bolalar stomatologiyasi bo'yicha 60 dan ortiq shifokor.",
		dist: '2.4 km', is247: false, hoursLabel: 'Ochiq · 20:00 gacha', weekly: weeklyPattern('08:00 – 20:00'),
		branches: [
			{ id: 1, name: 'Smile Dental · Bunyodkor', addr: "Bunyodkor ko'ch. 27 (Chilonzor), Toshkent", hours: 'Kecha-kunduz · 24/7', docs: 14, phone: '+998 71 200-11-01', lat: 41.2789, lng: 69.2044 },
			{ id: 2, name: 'Smile Dental · Amir Temur', addr: "Amir Temur shoh ko'ch. 108 (Yunusobod), Toshkent", hours: '20:00 gacha ochiq', docs: 12, phone: '+998 71 200-11-02', lat: 41.3489, lng: 69.2877 },
			{ id: 3, name: 'Smile Dental · Mustaqillik', addr: "Mustaqillik ko'ch. 14 (Mirzo Ulug'bek), Toshkent", hours: 'Kecha-kunduz · 24/7', docs: 11, phone: '+998 71 200-11-03', lat: 41.3378, lng: 69.3372 },
			{ id: 4, name: 'Smile Dental · Qatortol', addr: "Qatortol ko'ch. 4A (Chilonzor), Toshkent", hours: '19:00 gacha ochiq', docs: 9, phone: '+998 71 200-11-04', lat: 41.2820, lng: 69.2100 },
		],
	},
	{
		id: 2, slug: 'dent-pro', logo: 'DP', logoBg: 'linear-gradient(135deg,#EDE9FE,#E0F2FE)', logoFg: '#7C3AED',
		name: 'Dent Pro Clinic', rating: '4.8', reviews: '1 204', docCount: 28,
		badges: [{ label: '24/7 ochiq', kind: 'green' }, { label: 'Tarmoq · 3 filial', kind: 'blue' }, { label: 'Shoshilinch yordam', kind: 'amber' }],
		desc: "Toshkentdagi kecha-kunduz ishlaydigan stomatologiya markazi. Shoshilinch tish og'rig'i, jarrohlik va protezlash.",
		dist: '3.1 km', is247: true, hoursLabel: '', weekly: null,
		branches: [
			{ id: 1, name: 'Dent Pro · Amir Temur', addr: "Amir Temur shoh ko'ch. 88, Yunusobod", hours: 'Kecha-kunduz · 24/7', docs: 10, phone: '+998 71 200-22-01', lat: 41.3450, lng: 69.2820 },
			{ id: 2, name: 'Dent Pro · Yakkasaroy', addr: 'Shota Rustaveli ko\'ch. 21, Yakkasaroy', hours: 'Kecha-kunduz · 24/7', docs: 9, phone: '+998 71 200-22-02', lat: 41.2897, lng: 69.2699 },
			{ id: 3, name: 'Dent Pro · Olmazor', addr: 'Chinobod ko\'ch. 12, Olmazor', hours: 'Kecha-kunduz · 24/7', docs: 9, phone: '+998 71 200-22-03', lat: 41.3614, lng: 69.2185 },
		],
	},
	{
		id: 3, slug: 'kidsdent', logo: 'KD', logoBg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', logoFg: '#DB2777',
		name: 'KidsDent', rating: '4.9', reviews: '876', docCount: 16,
		badges: [{ label: 'Faqat bolalar', kind: 'amber' }, { label: '2 filial', kind: 'blue' }],
		desc: "Bolalar uchun ixtisoslashgan stomatologiya — o'yin xonasi, sedatsiya va bolalar bilan ishlashga o'rgatilgan shifokorlar.",
		dist: '1.8 km', is247: false, hoursLabel: 'Ochiq · 18:00 gacha', weekly: weeklyPattern('09:00 – 18:00', 'Yopiq'),
		branches: [
			{ id: 1, name: 'KidsDent · Qatortol', addr: "Qatortol ko'ch. 4, Chilonzor", hours: '18:00 gacha ochiq', docs: 9, phone: '+998 71 200-33-01', lat: 41.2800, lng: 69.2070 },
			{ id: 2, name: "KidsDent · Buyuk Ipak Yo'li", addr: "Buyuk Ipak Yo'li 115, M.Ulug'bek", hours: '18:00 gacha ochiq', docs: 7, phone: '+998 71 200-33-02', lat: 41.3320, lng: 69.3280 },
		],
	},
]

export function getClinicById(id: number | string) {
	const numId = Number(id)
	return clinics.find((c) => c.id === numId) ?? clinics[0]
}

// Great-circle distance between two lat/lng points, in kilometers.
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
	const R = 6371
	const dLat = (lat2 - lat1) * Math.PI / 180
	const dLng = (lng2 - lng1) * Math.PI / 180
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface MapBranch {
	clinicId: number
	clinicSlug: string
	clinicName: string
	clinicLogo: string
	clinicLogoBg: string
	clinicLogoFg: string
	clinicRating: string
	branch: Branch
}

// Flat list of every branch across every clinic, for the map view — each
// entry keeps a reference back to its parent clinic for card rendering.
export function getAllMapBranches(): MapBranch[] {
	return clinics.flatMap((c) => c.branches.map((b) => ({
		clinicId: c.id,
		clinicSlug: c.slug,
		clinicName: c.name,
		clinicLogo: c.logo,
		clinicLogoBg: c.logoBg,
		clinicLogoFg: c.logoFg,
		clinicRating: c.rating,
		branch: b,
	})))
}

export const clinicSocials = [
	{ mark: 'IG', bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', handle: '@smiledental.uz' },
	{ mark: 'TG', bg: '#229ED9', handle: '@smiledental' },
	{ mark: 'TT', bg: '#0F172A', handle: '@smiledental' },
	{ mark: 'YT', bg: '#EF4444', handle: 'Smile Dental' },
	{ mark: 'FB', bg: '#1877F2', handle: 'smiledental.uz' },
]

export const clinicAboutServices = [
	'Raqamli rentgen va 3D KLKT', 'Barcha turdagi plombalar', 'Implantatsiya (Straumann, Osstem)',
	'Ortodontiya: breketlar va alignerlar', 'Protezlash: koronka, ko\'prik, vinir', 'Bolalar stomatologiyasi va profilaktika',
	'Professional gigiyena va oqartirish', 'Parodontologiya', 'Jarrohlik: tish olish, sinus-lifting', 'Umumiy narkoz ostida davolash',
]

export const clinicAboutSpecs = ['Terapiya', 'Ortodontiya', 'Implantologiya', 'Ortopediya', 'Jarrohlik', 'Parodontologiya', "Bolalar stomatologiyasi", 'Endodontiya', 'Gigiyena', 'Estetik stomatologiya', 'Rentgenologiya', 'Gnatologiya']

export const clinicPriceGroups = [
	{ name: 'Konsultatsiya', items: [{ name: 'Stomatolog konsultatsiyasi', price: "80 000 so'mdan" }, { name: 'Ortodont konsultatsiyasi + reja', price: "250 000 so'mdan" }] },
	{ name: 'Diagnostika', items: [{ name: 'Panoramik rentgen (OPTG)', price: "120 000 so'mdan" }, { name: '3D KLKT (konus-nurli tomografiya)', price: "350 000 so'mdan" }, { name: 'Nuqtali rentgen', price: "40 000 so'mdan" }] },
	{ name: 'Terapiya', items: [{ name: 'Kompozit plomba', price: "180 000 so'mdan" }, { name: 'Kanal davolash (1 kanal)', price: "350 000 so'mdan" }] },
	{ name: 'Gigiyena va profilaktika', items: [{ name: 'Professional tozalash (Air Flow)', price: "150 000 so'mdan" }, { name: 'Ftorlash', price: "90 000 so'mdan" }] },
	{ name: 'Ortodontiya', items: [{ name: 'Metall breket (2 jag\')', price: "8 500 000 so'mdan" }, { name: 'Keramik breket (2 jag\')', price: "12 000 000 so'mdan" }, { name: 'Aligner kursi', price: "so'rov bo'yicha" }] },
	{ name: 'Implantatsiya', items: [{ name: 'Implant o\'rnatish (Osstem)', price: "4 800 000 so'mdan" }, { name: 'Implant o\'rnatish (Straumann)', price: "9 200 000 so'mdan" }, { name: 'Sinus-lifting', price: "3 500 000 so'mdan" }] },
	{ name: 'Protezlash', items: [{ name: 'Sirkoniy koronka', price: "2 800 000 so'mdan" }, { name: 'Metall-keramika koronka', price: "1 500 000 so'mdan" }, { name: 'E-max vinir', price: "3 200 000 so'mdan" }] },
	{ name: 'Jarrohlik', items: [{ name: 'Oddiy tish olish', price: "250 000 so'mdan" }, { name: "Aql tishini olish (murakkab)", price: "900 000 so'mdan" }] },
]

export const clinicReviews: Review[] = [
	{ init: 'D', bg: '#E0F2FE', fg: '#0369A1', name: 'Dilnoza I.', date: '4 kun oldin', stars: '10/10', text: "Aziza Anvarovnaga katta rahmat. Breket qo'yishdan oldin barcha variantlarni tushuntirdi. Natija kutganimdan ham yaxshi chiqdi." },
	{ init: 'J', bg: '#D1FAE5', fg: '#047857', name: 'Jasur Q.', date: 'bugun', stars: '10/10', text: "Ikki tishga implant qo'ydirdim. Jarayon og'riqsiz o'tdi. Narxi CareNow orqali ancha arzonga tushdi." },
	{ init: 'N', bg: '#FCE7F3', fg: '#DB2777', name: 'Nigora T.', date: '1 hafta oldin', stars: '8/10', text: "Qizimni olib bordim, 6 yoshda. Malika Botirovna bolani qo'rqitmasdan ishladi." },
]

export interface ClinicDoctorSchedule {
	id: number
	init: string
	bg: string
	fg: string
	name: string
	spec: string
	exp: string
	top?: boolean
	kids?: boolean
	rating: string
	reviews: number
	oldPrice?: string
	price: string
	disc?: string
	branch: string
	addr: string
	days: { dow: string; date: string; times: string[] }[]
}

export const clinicDoctors: ClinicDoctorSchedule[] = [
	{ id: 1, init: 'AK', bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0369A1', name: 'Karimova Aziza Anvarovna', spec: 'Ortodont, Implantolog, Bolalar ortodonti', exp: '12 yil', top: true, rating: '4,9', reviews: 312, oldPrice: "300 000 so'm", price: "250 000 so'mdan", disc: '−17%', branch: 'Bunyodkor', addr: "Bunyodkor ko'ch. 27 (Chilonzor), Toshkent", days: [
		{ dow: 'bugun', date: '6-avg', times: ['14:30', '15:00', '16:30', '17:30', '18:00'] },
		{ dow: 'ertaga', date: '7-avg', times: ['09:00', '10:00', '11:00', '14:00', '15:30'] },
		{ dow: 'sha', date: '8-avg', times: ['09:30', '10:30', '12:00', '13:30', '16:00'] },
		{ dow: 'yak', date: '9-avg', times: ['10:00', '11:30', '13:00', '15:00', '17:00'] },
	] },
	{ id: 2, init: 'BX', bg: 'linear-gradient(135deg,#D1FAE5,#E0F2FE)', fg: '#047857', name: "Bekmurodov Xurshid O'ktamovich", spec: 'Terapevt-stomatolog, Endodont', exp: '18 yil', top: true, rating: '4,8', reviews: 487, price: "180 000 so'mdan", branch: 'Amir Temur', addr: "Amir Temur shoh ko'ch. 108 (Yunusobod), Toshkent", days: [
		{ dow: 'bugun', date: '6-avg', times: ['11:00', '12:30', '15:00', '16:00'] },
		{ dow: 'ertaga', date: '7-avg', times: ['09:00', '10:30', '13:00', '14:30', '17:00'] },
		{ dow: 'sha', date: '8-avg', times: ['10:00', '11:00', '12:00'] },
		{ dow: 'yak', date: '9-avg', times: ['09:30', '11:30', '14:00', '16:30'] },
	] },
	{ id: 3, init: 'MT', bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#BE185D', name: 'Tosheva Malika Botirovna', spec: 'Bolalar stomatologi, Profilaktika', exp: '9 yil', kids: true, rating: '4,9', reviews: 178, oldPrice: "180 000 so'm", price: "150 000 so'mdan", disc: '−17%', branch: 'Mustaqillik', addr: "Mustaqillik ko'ch. 14 (Mirzo Ulug'bek), Toshkent", days: [
		{ dow: 'bugun', date: '6-avg', times: ['09:30', '10:00', '13:00', '15:30'] },
		{ dow: 'ertaga', date: '7-avg', times: ['09:00', '11:00', '12:30', '16:00', '17:30'] },
		{ dow: 'sha', date: '8-avg', times: ['10:30', '11:30', '13:30'] },
		{ dow: 'yak', date: '9-avg', times: ['09:00', '10:00', '12:00', '14:00'] },
	] },
]

export const servicesCatalog: ServiceRow[] = [
	{ emoji: '🪥', name: 'Professional tozalash', price: "150 000 – 400 000 so'm", docs: 214 },
	{ emoji: '🦷', name: 'Plomba (kompozit)', price: "180 000 – 500 000 so'm", docs: 322 },
	{ emoji: '✨', name: 'Tish oqartirish', price: "800 000 – 2 mln so'm", docs: 96 },
	{ emoji: '🔩', name: "Implant o'rnatish", price: '4 – 12 mln so\'m', docs: 143 },
	{ emoji: '😁', name: 'Breket tizimi', price: "6 – 18 mln so'm", docs: 88 },
	{ emoji: '👑', name: 'Koronka (qoplama)', price: "1.5 – 6 mln so'm", docs: 121 },
	{ emoji: '🧸', name: "Bolalar ko'rigi", price: "80 000 – 200 000 so'm", docs: 207 },
]

// ---- Doctor detail (page 4b) ----
export interface DoctorProfile {
	id: number
	name: string
	specs: string
	rating: string
	reviews: number
	exp: string
	tags: { label: string; fg: string; bg: string }[]
	stats: { value: string; label: string }[]
	clinic: { name: string; addr: string }
	about: string
	services: { emoji: string; name: string; dur: string; price: string }[]
	beforeAfter: { title: string; note: string }[]
	certs: { title: string; org: string; year: string }[]
	ratingBars: { n: number; w: string; c: number }[]
	reviewsList: Review[]
	price: { old: string; current: string; disc: string }
	socials: { mark: string; bg: string; handle: string; count?: string }[]
}

const doctorProfiles: DoctorProfile[] = [
	{
		id: 1, name: 'Aziza Karimova', specs: 'Ortodont · Implantolog', rating: '4.9', reviews: 312, exp: '12 yil',
		tags: [
			{ label: 'Staj 12 yil', fg: '#0369A1', bg: '#E0F2FE' },
			{ label: 'Oliy toifa', fg: '#B45309', bg: '#FEF3C7' },
			{ label: 'Invisalign sertifikati', fg: '#047857', bg: '#D1FAE5' },
			{ label: 'Bolalar bilan ishlaydi', fg: '#DB2777', bg: '#FCE7F3' },
		],
		stats: [{ value: '2 400+', label: 'qabul qilingan bemor' }, { value: '96%', label: 'yana tavsiya qiladi' }, { value: '~14 daq', label: "o'rtacha kutish" }],
		clinic: { name: 'Smile Dental Network', addr: "Bunyodkor ko'ch. 27, Chilonzor · 1.2 km" },
		about: "Toshkent Davlat Stomatologiya Institutini tamomlagan, 12 yildan beri ortodontiya bilan shug'ullanadi. Breket tizimlari va shaffof kapalar (aligner) bo'yicha ixtisoslashgan. Seul va Istanbulda malaka oshirgan.",
		services: [
			{ emoji: '🩺', name: 'Birinchi konsultatsiya + reja', dur: '40 daqiqa', price: "250 000 so'm" },
			{ emoji: '😁', name: "Metall breket (2 jag')", dur: '12–18 oy kurs', price: "8.5 mln so'm dan" },
			{ emoji: '💎', name: "Keramik breket (2 jag')", dur: '12–18 oy kurs', price: "12 mln so'm dan" },
			{ emoji: '🦷', name: 'Shaffof kapa (aligner)', dur: '9–14 oy kurs', price: "so'rov bo'yicha" },
			{ emoji: '🔩', name: "Implant o'rnatish", dur: '1 tashrif', price: "4.8 mln so'm dan" },
		],
		beforeAfter: [
			{ title: 'Breket · 14 oy', note: '24 yosh, tishlar zichligi' },
			{ title: 'Aligner · 9 oy', note: '31 yosh, oldingi tishlar' },
			{ title: 'Implant + koronka', note: '45 yosh, 36-tish' },
		],
		certs: [
			{ title: 'Stomatologiya · magistratura', org: 'Toshkent Davlat Stomatologiya Instituti', year: '2014' },
			{ title: 'Ortodontiya ordinaturasi', org: 'TDSI · klinik ordinatura', year: '2016' },
			{ title: 'Invisalign Provider sertifikati', org: 'Align Technology, Istanbul', year: '2021' },
			{ title: 'Oliy toifa attestatsiyasi', org: "O'zbekiston Sog'liqni saqlash vazirligi", year: '2023' },
		],
		ratingBars: [{ n: 5, w: '92%', c: 287 }, { n: 4, w: '6%', c: 19 }, { n: 3, w: '2%', c: 4 }, { n: 2, w: '0%', c: 1 }, { n: 1, w: '0%', c: 1 }],
		reviewsList: [
			{ init: 'DS', bg: '#E0F2FE', fg: '#0369A1', name: 'Dilnoza S.', date: '2 hafta oldin', service: "Breket o'rnatish", stars: '5', text: "Aziza Anvarovna butun jarayonni oldindan tushuntirib berdi. 14 oy davomida har oy nazorat qildi. Natijadan juda mamnunman." },
			{ init: 'RT', bg: '#D1FAE5', fg: '#047857', name: 'Rustam T.', date: '1 oy oldin', service: 'Konsultatsiya', stars: '5', text: "Boshqa klinikada menga darrov breket taklif qilishgan edi. Bu yerda avval rentgen qilib, kapa bilan ham bo'lishini aytdi." },
			{ init: 'MK', bg: '#FCE7F3', fg: '#DB2777', name: 'Malika K.', date: '2 oy oldin', service: 'Aligner', stars: '4', text: "Shifokor a'lo, lekin qabul 20 daqiqa kechikdi. Davolash sifatiga hech qanday e'tiroz yo'q." },
		],
		price: { old: '300 000', current: '250 000', disc: '−17%' },
		socials: [
			{ mark: 'IG', bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', handle: '@dr.azizakarimova', count: '48.2K' },
			{ mark: 'TG', bg: '#229ED9', handle: '@dr_aziza', count: '12.4K' },
			{ mark: 'TT', bg: '#0F172A', handle: '@dr.aziza', count: '96K' },
			{ mark: 'YT', bg: '#EF4444', handle: 'Ortodont bilan suhbat' },
		],
	},
]

export function getDoctorProfile(id: number | string) {
	const numId = Number(id)
	return doctorProfiles.find((d) => d.id === numId) ?? doctorProfiles[0]
}

export const docDaysOptions = [{ dow: 'Pay', n: 13 }, { dow: 'Juma', n: 14 }, { dow: 'Shan', n: 15 }, { dow: 'Dush', n: 17 }]
export const docSlotSets: string[][] = [
	['09:00', '10:30', '11:00', '14:00', '15:30', '16:00'],
	['09:30', '11:00', '13:00', '14:30', '15:00', '16:30', '17:00', '18:00', '18:30'],
	['10:00', '10:30', '12:00', '13:30'],
	['09:00', '09:30', '11:30', '14:00', '16:00', '17:30'],
]

// ---- B2B pricing (page 6) ----
export const bizTariffs = [
	{ id: 'start', name: 'Start', price: 'Bepul', note: 'har yozuvdan 8% komissiya', features: [
		{ ok: true, text: '1 filial · 5 shifokor' }, { ok: true, text: 'Onlayn yozuv 24/7' }, { ok: true, text: 'SMS eslatmalar' },
		{ ok: false, text: 'Analitika' }, { ok: false, text: 'Promo joylashuv' },
	], cta: 'Boshlash', highlight: false },
	{ id: 'pro', name: 'Pro', price: "1.2 mln so'm/oy", note: 'komissiya 4% · filial uchun', features: [
		{ ok: true, text: '5 tagacha filial · cheksiz shifokor' }, { ok: true, text: 'Odontogram + EMR' }, { ok: true, text: 'Analitika va hisobotlar' },
		{ ok: true, text: 'Promo joylashuv (oyiga 2 hafta)' }, { ok: true, text: "Ustuvor qo'llab-quvvatlash" },
	], cta: 'Tanlash', highlight: true, badge: 'MASHHUR' },
	{ id: 'network', name: 'Network', price: 'Individual', note: '6+ filialli tarmoqlar uchun', features: [
		{ ok: true, text: 'Cheksiz filial va shifokor' }, { ok: true, text: 'API integratsiya (1C, MIS)' }, { ok: true, text: 'Shaxsiy menejer' },
		{ ok: true, text: 'Brendlangan sahifa' }, { ok: true, text: 'Marketing hamkorligi' },
	], cta: "Bog'lanish", highlight: false, dark: true },
]

// ---- Patient profile (page 8) ----
export const upcomingAppointment = {
	date: { day: 'AVG', n: 14, dow: 'Juma' },
	time: '14:30',
	title: 'Konsultatsiya · Dr. Aziza Karimova',
	place: "Smile Dental · Bunyodkor ko'ch. 27, Chilonzor",
}

export const pastAppointments = [
	{ init: 'AK', bg: 'linear-gradient(135deg,#E0F2FE,#D1FAE5)', fg: '#0369A1', title: 'Professional tozalash · Dr. Karimova', meta: '12-iyun 2026 · Smile Dental', status: 'done' as const },
	{ init: 'RS', bg: 'linear-gradient(135deg,#EDE9FE,#E0F2FE)', fg: '#7C3AED', title: 'Plomba · Dr. Saidov', meta: '3-mart 2026 · Dent Pro', status: 'rated' as const },
	{ init: 'MT', bg: 'linear-gradient(135deg,#FEF3C7,#FCE7F3)', fg: '#DB2777', title: "Bolalar ko'rigi · Dr. Tosheva (Aisha uchun)", meta: '18-yanvar 2026 · KidsDent', status: 'cancelled' as const },
]

export const familyMembers = [
	{ init: 'AY', bg: '#FCE7F3', fg: '#DB2777', name: 'Aisha', rel: 'qizi · 6 yosh' },
	{ init: 'BY', bg: '#E0F2FE', fg: '#0369A1', name: 'Bobur', rel: "turmush o'rtog'i" },
]
