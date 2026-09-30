import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_uz.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('uz'),
    Locale('ru'),
    Locale('en'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In uz, this message translates to:
  /// **'CareNow'**
  String get appTitle;

  /// No description provided for @navDoctors.
  ///
  /// In uz, this message translates to:
  /// **'Shifokorlar'**
  String get navDoctors;

  /// No description provided for @navClinics.
  ///
  /// In uz, this message translates to:
  /// **'Klinikalar'**
  String get navClinics;

  /// No description provided for @navBookings.
  ///
  /// In uz, this message translates to:
  /// **'Yozuvlar'**
  String get navBookings;

  /// No description provided for @navFavorites.
  ///
  /// In uz, this message translates to:
  /// **'Sevimlilar'**
  String get navFavorites;

  /// No description provided for @navProfile.
  ///
  /// In uz, this message translates to:
  /// **'Profil'**
  String get navProfile;

  /// No description provided for @commonRetry.
  ///
  /// In uz, this message translates to:
  /// **'Qayta urinish'**
  String get commonRetry;

  /// No description provided for @commonCancel.
  ///
  /// In uz, this message translates to:
  /// **'Bekor qilish'**
  String get commonCancel;

  /// No description provided for @commonSave.
  ///
  /// In uz, this message translates to:
  /// **'Saqlash'**
  String get commonSave;

  /// No description provided for @commonOk.
  ///
  /// In uz, this message translates to:
  /// **'OK'**
  String get commonOk;

  /// No description provided for @commonLoading.
  ///
  /// In uz, this message translates to:
  /// **'Yuklanmoqda…'**
  String get commonLoading;

  /// No description provided for @commonNetworkError.
  ///
  /// In uz, this message translates to:
  /// **'Server bilan aloqa yo\'q. Internetni tekshiring.'**
  String get commonNetworkError;

  /// No description provided for @commonConfirm.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlash'**
  String get commonConfirm;

  /// No description provided for @commonSearch.
  ///
  /// In uz, this message translates to:
  /// **'Qidirish'**
  String get commonSearch;

  /// No description provided for @authLoginTitle.
  ///
  /// In uz, this message translates to:
  /// **'Kirish'**
  String get authLoginTitle;

  /// No description provided for @authPhoneLabel.
  ///
  /// In uz, this message translates to:
  /// **'Telefon raqami'**
  String get authPhoneLabel;

  /// No description provided for @authPhoneHint.
  ///
  /// In uz, this message translates to:
  /// **'+998 90 123 45 67'**
  String get authPhoneHint;

  /// No description provided for @authContinueButton.
  ///
  /// In uz, this message translates to:
  /// **'Davom etish'**
  String get authContinueButton;

  /// No description provided for @authOrDivider.
  ///
  /// In uz, this message translates to:
  /// **'yoki'**
  String get authOrDivider;

  /// No description provided for @authGoogleButton.
  ///
  /// In uz, this message translates to:
  /// **'Google orqali kirish'**
  String get authGoogleButton;

  /// No description provided for @authOtpTitle.
  ///
  /// In uz, this message translates to:
  /// **'Kodni kiriting'**
  String get authOtpTitle;

  /// No description provided for @authOtpSubtitle.
  ///
  /// In uz, this message translates to:
  /// **'{phone} raqamiga yuborilgan 4 xonali kodni kiriting'**
  String authOtpSubtitle(String phone);

  /// No description provided for @authOtpLabel.
  ///
  /// In uz, this message translates to:
  /// **'SMS kod'**
  String get authOtpLabel;

  /// No description provided for @authVerifyButton.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlash'**
  String get authVerifyButton;

  /// No description provided for @authResendCode.
  ///
  /// In uz, this message translates to:
  /// **'Kodni qayta yuborish'**
  String get authResendCode;

  /// No description provided for @authDevCodeHint.
  ///
  /// In uz, this message translates to:
  /// **'Test rejimi: kod — {code}'**
  String authDevCodeHint(String code);

  /// No description provided for @authInvalidCode.
  ///
  /// In uz, this message translates to:
  /// **'Kod noto\'g\'ri yoki muddati tugagan'**
  String get authInvalidCode;

  /// No description provided for @authInvalidPhone.
  ///
  /// In uz, this message translates to:
  /// **'Telefon raqamini to\'g\'ri kiriting'**
  String get authInvalidPhone;

  /// No description provided for @doctorsTitle.
  ///
  /// In uz, this message translates to:
  /// **'Shifokorlar'**
  String get doctorsTitle;

  /// No description provided for @doctorsSearchHint.
  ///
  /// In uz, this message translates to:
  /// **'Ism yoki mutaxassislik bo\'yicha qidirish'**
  String get doctorsSearchHint;

  /// No description provided for @doctorsEmpty.
  ///
  /// In uz, this message translates to:
  /// **'Hali shifokor qo\'shilmagan'**
  String get doctorsEmpty;

  /// No description provided for @doctorsSortRating.
  ///
  /// In uz, this message translates to:
  /// **'Reyting bo\'yicha'**
  String get doctorsSortRating;

  /// No description provided for @doctorsSortExperience.
  ///
  /// In uz, this message translates to:
  /// **'Staj bo\'yicha'**
  String get doctorsSortExperience;

  /// No description provided for @doctorDetailExperience.
  ///
  /// In uz, this message translates to:
  /// **'{years} yil staj'**
  String doctorDetailExperience(String years);

  /// No description provided for @doctorDetailReviews.
  ///
  /// In uz, this message translates to:
  /// **'{n} sharh'**
  String doctorDetailReviews(int n);

  /// No description provided for @doctorDetailBookButton.
  ///
  /// In uz, this message translates to:
  /// **'Yozilish'**
  String get doctorDetailBookButton;

  /// No description provided for @doctorDetailAvailabilityTitle.
  ///
  /// In uz, this message translates to:
  /// **'Bo\'sh vaqtlar'**
  String get doctorDetailAvailabilityTitle;

  /// No description provided for @doctorDetailNoSlots.
  ///
  /// In uz, this message translates to:
  /// **'Bu kunga bo\'sh vaqt yo\'q'**
  String get doctorDetailNoSlots;

  /// No description provided for @doctorDetailSelectDate.
  ///
  /// In uz, this message translates to:
  /// **'Sanani tanlang'**
  String get doctorDetailSelectDate;

  /// No description provided for @doctorDetailFavoriteAdd.
  ///
  /// In uz, this message translates to:
  /// **'Sevimlilarga qo\'shish'**
  String get doctorDetailFavoriteAdd;

  /// No description provided for @doctorDetailFavoriteRemove.
  ///
  /// In uz, this message translates to:
  /// **'Sevimlilardan olib tashlash'**
  String get doctorDetailFavoriteRemove;

  /// No description provided for @clinicsTitle.
  ///
  /// In uz, this message translates to:
  /// **'Klinikalar'**
  String get clinicsTitle;

  /// No description provided for @clinicsSearchHint.
  ///
  /// In uz, this message translates to:
  /// **'Klinika nomi bo\'yicha qidirish'**
  String get clinicsSearchHint;

  /// No description provided for @clinicsFilterAll.
  ///
  /// In uz, this message translates to:
  /// **'Hammasi'**
  String get clinicsFilterAll;

  /// No description provided for @clinicsFilter247.
  ///
  /// In uz, this message translates to:
  /// **'24/7 ochiq'**
  String get clinicsFilter247;

  /// No description provided for @clinicsFilterKids.
  ///
  /// In uz, this message translates to:
  /// **'Bolalar bo\'limi bor'**
  String get clinicsFilterKids;

  /// No description provided for @clinicsFilterNetwork.
  ///
  /// In uz, this message translates to:
  /// **'Tarmoq (filiallari koʻp)'**
  String get clinicsFilterNetwork;

  /// No description provided for @clinicsFilterTopRated.
  ///
  /// In uz, this message translates to:
  /// **'Yuqori reyting'**
  String get clinicsFilterTopRated;

  /// No description provided for @clinicsEmpty.
  ///
  /// In uz, this message translates to:
  /// **'Klinika topilmadi'**
  String get clinicsEmpty;

  /// No description provided for @clinicsMapButton.
  ///
  /// In uz, this message translates to:
  /// **'Xaritada ko\'rish'**
  String get clinicsMapButton;

  /// No description provided for @clinicsDoctorsCount.
  ///
  /// In uz, this message translates to:
  /// **'{n} shifokor'**
  String clinicsDoctorsCount(int n);

  /// No description provided for @clinicDetailTabBranches.
  ///
  /// In uz, this message translates to:
  /// **'Filiallar'**
  String get clinicDetailTabBranches;

  /// No description provided for @clinicDetailTabDoctors.
  ///
  /// In uz, this message translates to:
  /// **'Shifokorlar'**
  String get clinicDetailTabDoctors;

  /// No description provided for @clinicDetailTabServices.
  ///
  /// In uz, this message translates to:
  /// **'Xizmatlar'**
  String get clinicDetailTabServices;

  /// No description provided for @clinicDetailNoReviewsYet.
  ///
  /// In uz, this message translates to:
  /// **'Sharh matnlari hali mavjud emas'**
  String get clinicDetailNoReviewsYet;

  /// No description provided for @mapNoKeyTitle.
  ///
  /// In uz, this message translates to:
  /// **'Xarita hozircha mavjud emas'**
  String get mapNoKeyTitle;

  /// No description provided for @mapNoKeyMessage.
  ///
  /// In uz, this message translates to:
  /// **'Yandex MapKit kaliti sozlanmagan. Quyida klinikalar ro\'yxatini ko\'rishda davom etishingiz mumkin.'**
  String get mapNoKeyMessage;

  /// No description provided for @mapMyLocation.
  ///
  /// In uz, this message translates to:
  /// **'Menga yaqin'**
  String get mapMyLocation;

  /// No description provided for @mapBranchesCount.
  ///
  /// In uz, this message translates to:
  /// **'{n} ta filial'**
  String mapBranchesCount(int n);

  /// No description provided for @bookingConfirmTitle.
  ///
  /// In uz, this message translates to:
  /// **'Yozuvni tasdiqlaysizmi?'**
  String get bookingConfirmTitle;

  /// No description provided for @bookingConfirmMessage.
  ///
  /// In uz, this message translates to:
  /// **'{doctor} · {date} · {time}'**
  String bookingConfirmMessage(String doctor, String date, String time);

  /// No description provided for @bookingConfirmButton.
  ///
  /// In uz, this message translates to:
  /// **'Yozilish'**
  String get bookingConfirmButton;

  /// No description provided for @bookingSuccessMessage.
  ///
  /// In uz, this message translates to:
  /// **'Siz muvaffaqiyatli yozildingiz'**
  String get bookingSuccessMessage;

  /// No description provided for @bookingSlotTakenError.
  ///
  /// In uz, this message translates to:
  /// **'Bu vaqt band qilindi, boshqasini tanlang'**
  String get bookingSlotTakenError;

  /// No description provided for @bookingSelectSlotFirst.
  ///
  /// In uz, this message translates to:
  /// **'Avval vaqtni tanlang'**
  String get bookingSelectSlotFirst;

  /// No description provided for @myBookingsTitle.
  ///
  /// In uz, this message translates to:
  /// **'Mening yozuvlarim'**
  String get myBookingsTitle;

  /// No description provided for @myBookingsEmpty.
  ///
  /// In uz, this message translates to:
  /// **'Hali yozuv yo\'q'**
  String get myBookingsEmpty;

  /// No description provided for @myBookingsCancelButton.
  ///
  /// In uz, this message translates to:
  /// **'Bekor qilish'**
  String get myBookingsCancelButton;

  /// No description provided for @myBookingsCancelConfirmTitle.
  ///
  /// In uz, this message translates to:
  /// **'Yozuvni bekor qilasizmi?'**
  String get myBookingsCancelConfirmTitle;

  /// No description provided for @myBookingsCancelConfirmMessage.
  ///
  /// In uz, this message translates to:
  /// **'Bu amalni ortga qaytarib bo\'lmaydi'**
  String get myBookingsCancelConfirmMessage;

  /// No description provided for @myBookingsStatusPending.
  ///
  /// In uz, this message translates to:
  /// **'Kutilmoqda'**
  String get myBookingsStatusPending;

  /// No description provided for @myBookingsStatusConfirmed.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlangan'**
  String get myBookingsStatusConfirmed;

  /// No description provided for @myBookingsStatusCancelled.
  ///
  /// In uz, this message translates to:
  /// **'Bekor qilingan'**
  String get myBookingsStatusCancelled;

  /// No description provided for @myBookingsStatusCompleted.
  ///
  /// In uz, this message translates to:
  /// **'Yakunlangan'**
  String get myBookingsStatusCompleted;

  /// No description provided for @favoritesTitle.
  ///
  /// In uz, this message translates to:
  /// **'Sevimli shifokorlar'**
  String get favoritesTitle;

  /// No description provided for @favoritesEmpty.
  ///
  /// In uz, this message translates to:
  /// **'Hali sevimli shifokor yo\'q'**
  String get favoritesEmpty;

  /// No description provided for @profileTitle.
  ///
  /// In uz, this message translates to:
  /// **'Profil'**
  String get profileTitle;

  /// No description provided for @profileNameLabel.
  ///
  /// In uz, this message translates to:
  /// **'Ism'**
  String get profileNameLabel;

  /// No description provided for @profileSaveButton.
  ///
  /// In uz, this message translates to:
  /// **'Saqlash'**
  String get profileSaveButton;

  /// No description provided for @profileSavedMessage.
  ///
  /// In uz, this message translates to:
  /// **'Saqlandi'**
  String get profileSavedMessage;

  /// No description provided for @profileLogoutButton.
  ///
  /// In uz, this message translates to:
  /// **'Chiqish'**
  String get profileLogoutButton;

  /// No description provided for @profileLogoutConfirm.
  ///
  /// In uz, this message translates to:
  /// **'Hisobdan chiqmoqchimisiz?'**
  String get profileLogoutConfirm;

  /// No description provided for @profileLanguage.
  ///
  /// In uz, this message translates to:
  /// **'Til'**
  String get profileLanguage;

  /// No description provided for @doctorPanelDashboardTitle.
  ///
  /// In uz, this message translates to:
  /// **'Kabinet'**
  String get doctorPanelDashboardTitle;

  /// No description provided for @doctorPanelNoProfileLinked.
  ///
  /// In uz, this message translates to:
  /// **'Bu hisobga shifokor profili ulanmagan'**
  String get doctorPanelNoProfileLinked;

  /// No description provided for @doctorPanelAvailabilityTitle.
  ///
  /// In uz, this message translates to:
  /// **'Ish jadvali'**
  String get doctorPanelAvailabilityTitle;

  /// No description provided for @doctorPanelAddSlot.
  ///
  /// In uz, this message translates to:
  /// **'Kun qo\'shish'**
  String get doctorPanelAddSlot;

  /// No description provided for @doctorPanelDayOfWeek.
  ///
  /// In uz, this message translates to:
  /// **'Hafta kuni'**
  String get doctorPanelDayOfWeek;

  /// No description provided for @doctorPanelStartTime.
  ///
  /// In uz, this message translates to:
  /// **'Boshlanish vaqti'**
  String get doctorPanelStartTime;

  /// No description provided for @doctorPanelEndTime.
  ///
  /// In uz, this message translates to:
  /// **'Tugash vaqti'**
  String get doctorPanelEndTime;

  /// No description provided for @doctorPanelSlotMinutes.
  ///
  /// In uz, this message translates to:
  /// **'Qabul davomiyligi (daqiqa)'**
  String get doctorPanelSlotMinutes;

  /// No description provided for @doctorPanelSaveAvailability.
  ///
  /// In uz, this message translates to:
  /// **'Jadvalni saqlash'**
  String get doctorPanelSaveAvailability;

  /// No description provided for @doctorPanelReplaceConfirmTitle.
  ///
  /// In uz, this message translates to:
  /// **'Jadval almashtiriladi'**
  String get doctorPanelReplaceConfirmTitle;

  /// No description provided for @doctorPanelReplaceConfirmMessage.
  ///
  /// In uz, this message translates to:
  /// **'Eski jadval butunlay yangisi bilan almashtiriladi. Davom etasizmi?'**
  String get doctorPanelReplaceConfirmMessage;

  /// No description provided for @doctorPanelBookingsTitle.
  ///
  /// In uz, this message translates to:
  /// **'Yozuvlar'**
  String get doctorPanelBookingsTitle;

  /// No description provided for @doctorPanelPatientLabel.
  ///
  /// In uz, this message translates to:
  /// **'Bemor'**
  String get doctorPanelPatientLabel;

  /// No description provided for @doctorPanelNoBookings.
  ///
  /// In uz, this message translates to:
  /// **'Hali yozuv yo\'q'**
  String get doctorPanelNoBookings;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ru', 'uz'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ru':
      return AppLocalizationsRu();
    case 'uz':
      return AppLocalizationsUz();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
