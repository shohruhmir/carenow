// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Uzbek (`uz`).
class AppLocalizationsUz extends AppLocalizations {
  AppLocalizationsUz([String locale = 'uz']) : super(locale);

  @override
  String get appTitle => 'CareNow';

  @override
  String get navDoctors => 'Shifokorlar';

  @override
  String get navClinics => 'Klinikalar';

  @override
  String get navBookings => 'Yozuvlar';

  @override
  String get navFavorites => 'Sevimlilar';

  @override
  String get navProfile => 'Profil';

  @override
  String get commonRetry => 'Qayta urinish';

  @override
  String get commonCancel => 'Bekor qilish';

  @override
  String get commonSave => 'Saqlash';

  @override
  String get commonOk => 'OK';

  @override
  String get commonLoading => 'Yuklanmoqda…';

  @override
  String get commonNetworkError =>
      'Server bilan aloqa yo\'q. Internetni tekshiring.';

  @override
  String get commonConfirm => 'Tasdiqlash';

  @override
  String get commonSearch => 'Qidirish';

  @override
  String get authLoginTitle => 'Kirish';

  @override
  String get authPhoneLabel => 'Telefon raqami';

  @override
  String get authPhoneHint => '+998 90 123 45 67';

  @override
  String get authContinueButton => 'Davom etish';

  @override
  String get authOrDivider => 'yoki';

  @override
  String get authGoogleButton => 'Google orqali kirish';

  @override
  String get authOtpTitle => 'Kodni kiriting';

  @override
  String authOtpSubtitle(String phone) {
    return '$phone raqamiga yuborilgan 4 xonali kodni kiriting';
  }

  @override
  String get authOtpLabel => 'SMS kod';

  @override
  String get authVerifyButton => 'Tasdiqlash';

  @override
  String get authResendCode => 'Kodni qayta yuborish';

  @override
  String authDevCodeHint(String code) {
    return 'Test rejimi: kod — $code';
  }

  @override
  String get authInvalidCode => 'Kod noto\'g\'ri yoki muddati tugagan';

  @override
  String get authInvalidPhone => 'Telefon raqamini to\'g\'ri kiriting';

  @override
  String get doctorsTitle => 'Shifokorlar';

  @override
  String get doctorsSearchHint => 'Ism yoki mutaxassislik bo\'yicha qidirish';

  @override
  String get doctorsEmpty => 'Hali shifokor qo\'shilmagan';

  @override
  String get doctorsSortRating => 'Reyting bo\'yicha';

  @override
  String get doctorsSortExperience => 'Staj bo\'yicha';

  @override
  String doctorDetailExperience(String years) {
    return '$years yil staj';
  }

  @override
  String doctorDetailReviews(int n) {
    return '$n sharh';
  }

  @override
  String get doctorDetailBookButton => 'Yozilish';

  @override
  String get doctorDetailAvailabilityTitle => 'Bo\'sh vaqtlar';

  @override
  String get doctorDetailNoSlots => 'Bu kunga bo\'sh vaqt yo\'q';

  @override
  String get doctorDetailSelectDate => 'Sanani tanlang';

  @override
  String get doctorDetailFavoriteAdd => 'Sevimlilarga qo\'shish';

  @override
  String get doctorDetailFavoriteRemove => 'Sevimlilardan olib tashlash';

  @override
  String get clinicsTitle => 'Klinikalar';

  @override
  String get clinicsSearchHint => 'Klinika nomi bo\'yicha qidirish';

  @override
  String get clinicsFilterAll => 'Hammasi';

  @override
  String get clinicsFilter247 => '24/7 ochiq';

  @override
  String get clinicsFilterKids => 'Bolalar bo\'limi bor';

  @override
  String get clinicsFilterNetwork => 'Tarmoq (filiallari koʻp)';

  @override
  String get clinicsFilterTopRated => 'Yuqori reyting';

  @override
  String get clinicsEmpty => 'Klinika topilmadi';

  @override
  String get clinicsMapButton => 'Xaritada ko\'rish';

  @override
  String clinicsDoctorsCount(int n) {
    return '$n shifokor';
  }

  @override
  String get clinicDetailTabBranches => 'Filiallar';

  @override
  String get clinicDetailTabDoctors => 'Shifokorlar';

  @override
  String get clinicDetailTabServices => 'Xizmatlar';

  @override
  String get clinicDetailNoReviewsYet => 'Sharh matnlari hali mavjud emas';

  @override
  String get mapNoKeyTitle => 'Xarita hozircha mavjud emas';

  @override
  String get mapNoKeyMessage =>
      'Yandex MapKit kaliti sozlanmagan. Quyida klinikalar ro\'yxatini ko\'rishda davom etishingiz mumkin.';

  @override
  String get mapMyLocation => 'Menga yaqin';

  @override
  String mapBranchesCount(int n) {
    return '$n ta filial';
  }

  @override
  String get bookingConfirmTitle => 'Yozuvni tasdiqlaysizmi?';

  @override
  String bookingConfirmMessage(String doctor, String date, String time) {
    return '$doctor · $date · $time';
  }

  @override
  String get bookingConfirmButton => 'Yozilish';

  @override
  String get bookingSuccessMessage => 'Siz muvaffaqiyatli yozildingiz';

  @override
  String get bookingSlotTakenError =>
      'Bu vaqt band qilindi, boshqasini tanlang';

  @override
  String get bookingSelectSlotFirst => 'Avval vaqtni tanlang';

  @override
  String get myBookingsTitle => 'Mening yozuvlarim';

  @override
  String get myBookingsEmpty => 'Hali yozuv yo\'q';

  @override
  String get myBookingsCancelButton => 'Bekor qilish';

  @override
  String get myBookingsCancelConfirmTitle => 'Yozuvni bekor qilasizmi?';

  @override
  String get myBookingsCancelConfirmMessage =>
      'Bu amalni ortga qaytarib bo\'lmaydi';

  @override
  String get myBookingsStatusPending => 'Kutilmoqda';

  @override
  String get myBookingsStatusConfirmed => 'Tasdiqlangan';

  @override
  String get myBookingsStatusCancelled => 'Bekor qilingan';

  @override
  String get myBookingsStatusCompleted => 'Yakunlangan';

  @override
  String get favoritesTitle => 'Sevimli shifokorlar';

  @override
  String get favoritesEmpty => 'Hali sevimli shifokor yo\'q';

  @override
  String get profileTitle => 'Profil';

  @override
  String get profileNameLabel => 'Ism';

  @override
  String get profileSaveButton => 'Saqlash';

  @override
  String get profileSavedMessage => 'Saqlandi';

  @override
  String get profileLogoutButton => 'Chiqish';

  @override
  String get profileLogoutConfirm => 'Hisobdan chiqmoqchimisiz?';

  @override
  String get profileLanguage => 'Til';

  @override
  String get doctorPanelDashboardTitle => 'Kabinet';

  @override
  String get doctorPanelNoProfileLinked =>
      'Bu hisobga shifokor profili ulanmagan';

  @override
  String get doctorPanelAvailabilityTitle => 'Ish jadvali';

  @override
  String get doctorPanelAddSlot => 'Kun qo\'shish';

  @override
  String get doctorPanelDayOfWeek => 'Hafta kuni';

  @override
  String get doctorPanelStartTime => 'Boshlanish vaqti';

  @override
  String get doctorPanelEndTime => 'Tugash vaqti';

  @override
  String get doctorPanelSlotMinutes => 'Qabul davomiyligi (daqiqa)';

  @override
  String get doctorPanelSaveAvailability => 'Jadvalni saqlash';

  @override
  String get doctorPanelReplaceConfirmTitle => 'Jadval almashtiriladi';

  @override
  String get doctorPanelReplaceConfirmMessage =>
      'Eski jadval butunlay yangisi bilan almashtiriladi. Davom etasizmi?';

  @override
  String get doctorPanelBookingsTitle => 'Yozuvlar';

  @override
  String get doctorPanelPatientLabel => 'Bemor';

  @override
  String get doctorPanelNoBookings => 'Hali yozuv yo\'q';
}
