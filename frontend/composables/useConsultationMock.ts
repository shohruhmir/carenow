// UI-mockup-only data for the /consultation/[id] telemedicine screen.
// No backend model exists for consultation sessions/chat/files (see
// backend/prisma/schema.prisma) — delete this file once that feature is
// actually built, along with the mock video-call UI in
// pages/consultation/[id].vue that consumes it.

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
