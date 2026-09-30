// Seeds data matching frontend/composables/useCareNowData.ts so the real
// API returns something recognizable while the frontend is migrated off
// mocks. Safe to re-run (upserts by unique slug/id).
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'admin';
// Read from the environment (backend/.env, gitignored) rather than
// hardcoding a real credential in a file that gets committed. No fallback
// literal here on purpose — if it's unset, skip setting up password login
// rather than seed a guessable default into the database.
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri

async function main() {
  // Test clinic-admin account. A super-admin can now assign clinic owners
  // via PATCH /super-admin/clinics/:id/owner — this seed just bootstraps the
  // initial demo data before any super-admin has logged in to do that.
  const clinicAdmin = await prisma.user.upsert({
    where: { phone: '+998900000001' },
    update: { role: 'CLINIC_ADMIN' },
    create: { phone: '+998900000001', role: 'CLINIC_ADMIN', name: 'Smile Dental Admin' },
  });

  // Test super-admin account — logs in with username+password (see
  // POST /auth/admin-login) instead of phone+OTP, since a platform admin
  // shouldn't need a real SMS provider just to reach the internal panel.
  // Password login is only wired up if SUPER_ADMIN_PASSWORD is set
  // (backend/.env, gitignored) — no guessable default gets seeded.
  const passwordFields = SUPER_ADMIN_PASSWORD
    ? { username: SUPER_ADMIN_USERNAME, passwordHash: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10) }
    : {};
  if (!SUPER_ADMIN_PASSWORD) {
    console.warn('SUPER_ADMIN_PASSWORD not set in backend/.env — skipping admin username/password setup.');
  }
  await prisma.user.upsert({
    where: { phone: '+998900000003' },
    update: { role: 'SUPER_ADMIN', ...passwordFields },
    create: { phone: '+998900000003', role: 'SUPER_ADMIN', name: 'CareNow Platform Admin', ...passwordFields },
  });

  const smileDental = await prisma.clinic.upsert({
    where: { slug: 'smile-dental' },
    update: { ownerId: clinicAdmin.id },
    create: {
      slug: 'smile-dental',
      name: 'Smile Dental Network',
      desc: "2015-yildan beri ishlaydigan ko'p tarmoqli stomatologiya tarmog'i.",
      rating: 4.9,
      is247: false,
      ownerId: clinicAdmin.id,
      branches: {
        create: [
          { name: 'Smile Dental · Bunyodkor', address: "Bunyodkor ko'ch. 27 (Chilonzor), Toshkent", phone: '+998 71 200-11-01', lat: 41.2789, lng: 69.2044 },
          { name: 'Smile Dental · Amir Temur', address: "Amir Temur shoh ko'ch. 108 (Yunusobod), Toshkent", phone: '+998 71 200-11-02', lat: 41.3489, lng: 69.2877 },
        ],
      },
    },
    include: { branches: true },
  });

  const dentPro = await prisma.clinic.upsert({
    where: { slug: 'dent-pro' },
    update: {},
    create: {
      slug: 'dent-pro',
      name: 'Dent Pro Clinic',
      desc: 'Toshkentdagi kecha-kunduz ishlaydigan stomatologiya markazi.',
      rating: 4.8,
      is247: true,
      branches: {
        create: [{ name: 'Dent Pro · Amir Temur', address: "Amir Temur shoh ko'ch. 88, Yunusobod", phone: '+998 71 200-22-01', lat: 41.3450, lng: 69.2820 }],
      },
    },
    include: { branches: true },
  });

  const kidsDent = await prisma.clinic.upsert({
    where: { slug: 'kidsdent' },
    update: {},
    create: {
      slug: 'kidsdent',
      name: 'KidsDent',
      desc: "Bolalar uchun ixtisoslashgan stomatologiya.",
      rating: 4.9,
      is247: false,
      branches: {
        create: [{ name: 'KidsDent · Qatortol', address: "Qatortol ko'ch. 4, Chilonzor", phone: '+998 71 200-33-01', lat: 41.2800, lng: 69.2070 }],
      },
    },
    include: { branches: true },
  });

  // No unique constraint on Service (name+clinicId), so createMany's
  // skipDuplicates can't dedupe — check existence per-clinic instead.
  const serviceSeeds = [
    { clinicId: smileDental.id, name: 'Konsultatsiya', price: 80000 },
    { clinicId: smileDental.id, name: "Breket o'rnatish", price: 6000000 },
    { clinicId: dentPro.id, name: "Implant o'rnatish", price: 4800000 },
    { clinicId: kidsDent.id, name: 'Bolalar profilaktikasi', price: 100000 },
  ];
  for (const s of serviceSeeds) {
    const exists = await prisma.service.findFirst({ where: { clinicId: s.clinicId, name: s.name } });
    if (!exists) await prisma.service.create({ data: s });
  }

  const doctorSeeds = [
    { clinic: smileDental, name: 'Dr. Aziza Karimova', specialty: 'Ortodont', experienceYrs: 12, rating: 4.9, reviewsCount: 312 },
    { clinic: dentPro, name: 'Dr. Rustam Saidov', specialty: 'Implantolog', experienceYrs: 15, rating: 4.8, reviewsCount: 204 },
    { clinic: kidsDent, name: 'Dr. Malika Tosheva', specialty: 'Bolalar stomatologi', experienceYrs: 9, rating: 4.9, reviewsCount: 178 },
  ];

  for (const d of doctorSeeds) {
    const existing = await prisma.doctor.findFirst({ where: { name: d.name, clinicId: d.clinic.id } });
    const doctor = existing
      ? existing
      : await prisma.doctor.create({
          data: {
            clinicId: d.clinic.id,
            branchId: d.clinic.branches[0].id,
            name: d.name,
            specialty: d.specialty,
            experienceYrs: d.experienceYrs,
            rating: d.rating,
            reviewsCount: d.reviewsCount,
          },
        });

    const hasAvailability = await prisma.availability.findFirst({ where: { doctorId: doctor.id } });
    if (!hasAvailability) {
      await prisma.availability.createMany({
        data: WEEKDAYS.map((dayOfWeek) => ({ doctorId: doctor.id, dayOfWeek, startTime: '09:00', endTime: '18:00', slotMinutes: 30 })),
      });
    }

    // Test doctor-login account (mirrors the clinic-admin test account above)
    // — only Dr. Aziza Karimova gets one, since no self-service "link my
    // account" flow exists yet.
    if (d.name === 'Dr. Aziza Karimova') {
      const doctorUser = await prisma.user.upsert({
        where: { phone: '+998900000002' },
        update: { role: 'DOCTOR' },
        create: { phone: '+998900000002', role: 'DOCTOR', name: d.name },
      });
      await prisma.doctor.update({ where: { id: doctor.id }, data: { userId: doctorUser.id } });
    }
  }

  // Admin-editable site content (see SiteContent model). `uz` is the current
  // hardcoded string being migrated off a template; `ru`/`en` are left blank
  // unless a real translation already exists elsewhere (e.g. the i18n locale
  // files) — an admin fills them in later via /super-admin/content. Never
  // overwrites an existing row on re-run (`update: {}`) so a re-seed can't
  // clobber a value an admin has since edited in the panel.
  const siteContentSeeds: { key: string; label: string; uz: string; ru?: string; en?: string }[] = [
    { key: 'test.ping', label: 'Test — CMS quvur liniyasi tekshiruvi', uz: 'CMS ishlayapti' },

    // Homepage (pages/index.vue)
    { key: 'home.hero.badge', label: 'Bosh sahifa — Hero belgisi', uz: "24/7 onlayn yozilish · yashirin komissiyasiz" },
    { key: 'home.hero.title', label: 'Bosh sahifa — Hero sarlavhasi', uz: "Ishonchli stomatologni toping va 3 bosqichda yoziling" },
    { key: 'home.hero.subtitle', label: 'Bosh sahifa — Hero tavsifi', uz: "2 000+ tekshirilgan shifokor, haqiqiy bemor sharhlari va CareNow orqali maxsus chegirmali narxlar." },
    { key: 'home.stats.doctors.value', label: 'Bosh sahifa — Statistika: shifokorlar soni', uz: '2 000+' },
    { key: 'home.stats.doctors.label', label: 'Bosh sahifa — Statistika: shifokorlar yorlig\'i', uz: 'shifokor' },
    { key: 'home.stats.clinics.value', label: 'Bosh sahifa — Statistika: klinikalar soni', uz: '500+' },
    { key: 'home.stats.clinics.label', label: 'Bosh sahifa — Statistika: klinikalar yorlig\'i', uz: 'klinika' },
    { key: 'home.stats.bookings.value', label: 'Bosh sahifa — Statistika: yozilishlar soni', uz: '120k+' },
    { key: 'home.stats.bookings.label', label: 'Bosh sahifa — Statistika: yozilishlar yorlig\'i', uz: 'yozilish' },
    { key: 'home.stats.rating.value', label: 'Bosh sahifa — Statistika: reyting', uz: '4.9 ★' },
    { key: 'home.stats.rating.label', label: 'Bosh sahifa — Statistika: reyting yorlig\'i', uz: "o'rtacha reyting" },
    { key: 'home.specialties.title', label: 'Bosh sahifa — Yo\'nalishlar bo\'limi sarlavhasi', uz: "Stomatologiya yo'nalishlari" },
    { key: 'home.topDoctors.title', label: 'Bosh sahifa — Top shifokorlar sarlavhasi (shahar nomisiz)', uz: 'Eng yaxshi stomatologlar' },
    { key: 'home.steps.title', label: 'Bosh sahifa — "3 bosqich" bo\'limi sarlavhasi', uz: "3 bosqichda yozilish" },
    { key: 'home.steps.1.title', label: 'Bosh sahifa — 1-bosqich sarlavhasi', uz: 'Toping' },
    { key: 'home.steps.1.desc', label: 'Bosh sahifa — 1-bosqich tavsifi', uz: "Xizmat yoki shifokorni qidiring, sharh va narxlarni solishtiring" },
    { key: 'home.steps.2.title', label: 'Bosh sahifa — 2-bosqich sarlavhasi', uz: 'Vaqtni tanlang' },
    { key: 'home.steps.2.desc', label: 'Bosh sahifa — 2-bosqich tavsifi', uz: "Jonli kalendardan bo'sh soatni tanlang — telefon qilish shart emas" },
    { key: 'home.steps.3.title', label: 'Bosh sahifa — 3-bosqich sarlavhasi', uz: 'Yoziling' },
    { key: 'home.steps.3.desc', label: 'Bosh sahifa — 3-bosqich tavsifi', uz: "Tasdiqlash SMS orqali keladi. CareNow chegirmasi avtomatik qo'llanadi" },
    { key: 'home.b2b.eyebrow', label: 'Bosh sahifa — B2B banner ustki yorlig\'i', uz: 'Klinikalar uchun' },
    { key: 'home.b2b.title', label: 'Bosh sahifa — B2B banner sarlavhasi', uz: "Klinikangizni CareNow'ga ulang — bemorlar o'zi kelsin" },
    { key: 'home.b2b.desc', label: 'Bosh sahifa — B2B banner tavsifi', uz: "Onlayn yozuv kabineti, jadval boshqaruvi, bemorlar bazasi va analitika — shifokorlaringiz faqat davolash bilan shug'ullansin." },
    { key: 'home.b2b.feature.1.title', label: 'Bosh sahifa — B2B xususiyat 1 sarlavhasi', uz: 'Onlayn yozuv 24/7' },
    { key: 'home.b2b.feature.1.desc', label: 'Bosh sahifa — B2B xususiyat 1 tavsifi', uz: 'Resepshnsiz ham ishlaydi' },
    { key: 'home.b2b.feature.2.title', label: 'Bosh sahifa — B2B xususiyat 2 sarlavhasi', uz: '+40% yangi bemor' },
    { key: 'home.b2b.feature.2.desc', label: 'Bosh sahifa — B2B xususiyat 2 tavsifi', uz: "Birinchi 3 oyda o'rtacha" },
    { key: 'home.b2b.feature.3.title', label: 'Bosh sahifa — B2B xususiyat 3 sarlavhasi', uz: 'Odontogram va EMR' },
    { key: 'home.b2b.feature.3.desc', label: 'Bosh sahifa — B2B xususiyat 3 tavsifi', uz: 'Tish formulasi, rentgen, retseptlar' },
    { key: 'home.app.title', label: 'Bosh sahifa — Ilova banneri sarlavhasi', uz: "CareNow ilovasini yuklab oling" },
    { key: 'home.app.desc', label: 'Bosh sahifa — Ilova banneri tavsifi', uz: "Shifokor qidiring, eslatmalar oling, oila a'zolaringizni yozing va tibbiy kartangizni bitta ilovada saqlang." },

    // Business page (pages/business/index.vue)
    { key: 'business.hero.badge', label: 'Biznes — Hero belgisi', uz: 'Klinikalar uchun · CareNow Business' },
    { key: 'business.hero.title', label: 'Biznes — Hero sarlavhasi', uz: "Bo'sh kreslolaringizni bemorlar bilan to'ldiring" },
    { key: 'business.hero.desc', label: 'Biznes — Hero tavsifi', uz: "CareNow'dagi 120 000+ faol bemor auditoriyasiga ulaning. Onlayn yozuv, jadval, bemorlar bazasi, odontogram va analitika — bitta kabinetda." },
    { key: 'business.feature.1.title', label: 'Biznes — Xususiyat 1 sarlavhasi', uz: '+40% yangi bemor' },
    { key: 'business.feature.1.desc', label: 'Biznes — Xususiyat 1 tavsifi', uz: 'birinchi 3 oyda' },
    { key: 'business.feature.2.title', label: 'Biznes — Xususiyat 2 sarlavhasi', uz: "−30% yo'qolgan qabul" },
    { key: 'business.feature.2.desc', label: 'Biznes — Xususiyat 2 tavsifi', uz: 'avto-eslatmalar bilan' },
    { key: 'business.feature.3.title', label: 'Biznes — Xususiyat 3 sarlavhasi', uz: 'Odontogram + EMR' },
    { key: 'business.feature.3.desc', label: 'Biznes — Xususiyat 3 tavsifi', uz: 'tish formulasi, rentgen' },
    { key: 'business.feature.4.title', label: 'Biznes — Xususiyat 4 sarlavhasi', uz: 'Cheksiz filiallar' },
    { key: 'business.feature.4.desc', label: 'Biznes — Xususiyat 4 tavsifi', uz: 'yagona boshqaruv' },
    { key: 'business.tariffs.title', label: 'Biznes — Tariflar bo\'limi sarlavhasi', uz: 'Tariflar' },

    // Login page (pages/login.vue)
    { key: 'login.pitch.title', label: 'Kirish — Yon panel sarlavhasi', uz: "Sog'lig'ingiz uchun bitta hisob" },
    { key: 'login.pitch.bullet.1', label: 'Kirish — Yon panel 1-band', uz: 'Yozuvlaringiz va tibbiy kartangiz bir joyda' },
    { key: 'login.pitch.bullet.2', label: 'Kirish — Yon panel 2-band', uz: "Oila a'zolaringizni ham yozing" },
    { key: 'login.pitch.bullet.3', label: 'Kirish — Yon panel 3-band', uz: 'CareNow chegirmalari avtomatik qo\'llanadi' },
    { key: 'login.trust', label: 'Kirish — Ishonch qatori', uz: "120 000+ bemor allaqachon CareNow'da" },

    // Footer (components/CareNow/Footer.vue) — this one already had real
    // uz/ru/en translations via the i18n locale files (cn.footer.tagline),
    // so unlike every other key above, ru/en are NOT left blank here —
    // seeding blank would regress two already-working translations.
    {
      key: 'footer.description',
      label: 'Footer — Kompaniya tavsifi',
      uz: "Markaziy Osiyodagi eng yirik tibbiy marketpleys. Stomatologiyadan boshlab — barcha yo'nalishlarga.",
      ru: 'Крупнейший медицинский маркетплейс Центральной Азии. Начиная со стоматологии — во всех направлениях.',
      en: 'The largest healthcare marketplace in Central Asia. Starting with dentistry — expanding to every specialty.',
    },

    // Homepage quick-search chips (composables/useCareNowData.ts's popularSearches,
    // rendered on pages/index.vue) — 6 independent short items, modeled as
    // individual keys rather than introducing a list content type.
    { key: 'home.popularSearches.1', label: 'Bosh sahifa — Tezkor qidiruv chipi 1', uz: 'Implant' },
    { key: 'home.popularSearches.2', label: 'Bosh sahifa — Tezkor qidiruv chipi 2', uz: "Breket o'rnatish" },
    { key: 'home.popularSearches.3', label: 'Bosh sahifa — Tezkor qidiruv chipi 3', uz: 'Professional tozalash' },
    { key: 'home.popularSearches.4', label: 'Bosh sahifa — Tezkor qidiruv chipi 4', uz: 'Plomba' },
    { key: 'home.popularSearches.5', label: 'Bosh sahifa — Tezkor qidiruv chipi 5', uz: 'Bolalar stomatologiyasi' },
    { key: 'home.popularSearches.6', label: 'Bosh sahifa — Tezkor qidiruv chipi 6', uz: 'Oqartirish' },

    // Legal pages (pages/terms.vue, pages/privacy.vue) — new routes, did not
    // exist before this step. Placeholder boilerplate text, meant as an
    // editable starting point rather than reviewed legal copy.
    { key: 'legal.terms.title', label: 'Foydalanish shartlari — sarlavha', uz: 'Foydalanish shartlari' },
    {
      key: 'legal.terms.body',
      label: 'Foydalanish shartlari — matn',
      uz: "Ushbu sahifa CareNow platformasidan foydalanish shartlarini tavsiflaydi. Platformadan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.\n\nCareNow — bemorlar va stomatologiya klinikalarini bog'laydigan platforma. Platforma orqali amalga oshirilgan yozilishlar, ko'rsatilgan narxlar va xizmatlar tegishli klinika tomonidan taqdim etiladi va ular uchun javobgardir.\n\nPlatformadan noqonuniy yoki boshqa foydalanuvchilarga zarar yetkazadigan tarzda foydalanish taqiqlanadi.\n\nUshbu shartlar vaqti-vaqti bilan yangilanishi mumkin. Savollaringiz bo'lsa, biz bilan bog'laning.",
    },
    { key: 'legal.privacy.title', label: 'Maxfiylik siyosati — sarlavha', uz: 'Maxfiylik siyosati' },
    {
      key: 'legal.privacy.body',
      label: 'Maxfiylik siyosati — matn',
      uz: "Ushbu sahifa CareNow platformasi foydalanuvchilarning shaxsiy ma'lumotlarini qanday to'plashi, ishlatishi va saqlashini tavsiflaydi.\n\nBiz sizning ismingiz, telefon raqamingiz va yozilish tarixingiz kabi ma'lumotlarni xizmat ko'rsatish maqsadida to'playmiz. Bu ma'lumotlar uchinchi shaxslarga sizning roziligingizsiz berilmaydi, qonun talab qilgan hollar bundan mustasno.\n\nSiz istalgan vaqtda o'z ma'lumotlaringizni ko'rish, tahrirlash yoki o'chirishni so'rashingiz mumkin.\n\nSavollaringiz bo'lsa, biz bilan bog'laning.",
    },
  ];
  for (const c of siteContentSeeds) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: {},
      create: { key: c.key, label: c.label, uz: c.uz, ru: c.ru ?? '', en: c.en ?? '' },
    });
  }

  console.log('Seed complete:', { clinics: 3, doctors: doctorSeeds.length, siteContent: siteContentSeeds.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
