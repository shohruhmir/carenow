// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appTitle => 'CareNow';

  @override
  String get navDoctors => 'Врачи';

  @override
  String get navClinics => 'Клиники';

  @override
  String get navBookings => 'Записи';

  @override
  String get navFavorites => 'Избранное';

  @override
  String get navProfile => 'Профиль';

  @override
  String get commonRetry => 'Повторить';

  @override
  String get commonCancel => 'Отмена';

  @override
  String get commonSave => 'Сохранить';

  @override
  String get commonOk => 'ОК';

  @override
  String get commonLoading => 'Загрузка…';

  @override
  String get commonNetworkError => 'Нет связи с сервером. Проверьте интернет.';

  @override
  String get commonConfirm => 'Подтвердить';

  @override
  String get commonSearch => 'Поиск';

  @override
  String get authLoginTitle => 'Вход';

  @override
  String get authPhoneLabel => 'Номер телефона';

  @override
  String get authPhoneHint => '+998 90 123 45 67';

  @override
  String get authContinueButton => 'Продолжить';

  @override
  String get authOrDivider => 'или';

  @override
  String get authGoogleButton => 'Войти через Google';

  @override
  String get authOtpTitle => 'Введите код';

  @override
  String authOtpSubtitle(String phone) {
    return 'Введите 4-значный код, отправленный на $phone';
  }

  @override
  String get authOtpLabel => 'SMS-код';

  @override
  String get authVerifyButton => 'Подтвердить';

  @override
  String get authResendCode => 'Отправить код повторно';

  @override
  String authDevCodeHint(String code) {
    return 'Тестовый режим: код — $code';
  }

  @override
  String get authInvalidCode => 'Код неверен или срок его действия истёк';

  @override
  String get authInvalidPhone => 'Введите корректный номер телефона';

  @override
  String get doctorsTitle => 'Врачи';

  @override
  String get doctorsSearchHint => 'Поиск по имени или специальности';

  @override
  String get doctorsEmpty => 'Врачи пока не добавлены';

  @override
  String get doctorsSortRating => 'По рейтингу';

  @override
  String get doctorsSortExperience => 'По стажу';

  @override
  String doctorDetailExperience(String years) {
    return 'Стаж $years лет';
  }

  @override
  String doctorDetailReviews(int n) {
    return '$n отзывов';
  }

  @override
  String get doctorDetailBookButton => 'Записаться';

  @override
  String get doctorDetailAvailabilityTitle => 'Свободное время';

  @override
  String get doctorDetailNoSlots => 'На этот день нет свободного времени';

  @override
  String get doctorDetailSelectDate => 'Выберите дату';

  @override
  String get doctorDetailFavoriteAdd => 'В избранное';

  @override
  String get doctorDetailFavoriteRemove => 'Убрать из избранного';

  @override
  String get clinicsTitle => 'Клиники';

  @override
  String get clinicsSearchHint => 'Поиск по названию клиники';

  @override
  String get clinicsFilterAll => 'Все';

  @override
  String get clinicsFilter247 => 'Открыто 24/7';

  @override
  String get clinicsFilterKids => 'Есть детское отделение';

  @override
  String get clinicsFilterNetwork => 'Сеть (много филиалов)';

  @override
  String get clinicsFilterTopRated => 'Высокий рейтинг';

  @override
  String get clinicsEmpty => 'Клиники не найдены';

  @override
  String get clinicsMapButton => 'Показать на карте';

  @override
  String clinicsDoctorsCount(int n) {
    return '$n врачей';
  }

  @override
  String get clinicDetailTabBranches => 'Филиалы';

  @override
  String get clinicDetailTabDoctors => 'Врачи';

  @override
  String get clinicDetailTabServices => 'Услуги';

  @override
  String get clinicDetailNoReviewsYet => 'Отзывов пока нет';

  @override
  String get mapNoKeyTitle => 'Карта пока недоступна';

  @override
  String get mapNoKeyMessage =>
      'Ключ Yandex MapKit не настроен. Вы можете продолжить просмотр списка клиник ниже.';

  @override
  String get mapMyLocation => 'Рядом со мной';

  @override
  String mapBranchesCount(int n) {
    return '$n филиалов';
  }

  @override
  String get bookingConfirmTitle => 'Подтвердить запись?';

  @override
  String bookingConfirmMessage(String doctor, String date, String time) {
    return '$doctor · $date · $time';
  }

  @override
  String get bookingConfirmButton => 'Записаться';

  @override
  String get bookingSuccessMessage => 'Вы успешно записались';

  @override
  String get bookingSlotTakenError => 'Это время уже занято, выберите другое';

  @override
  String get bookingSelectSlotFirst => 'Сначала выберите время';

  @override
  String get myBookingsTitle => 'Мои записи';

  @override
  String get myBookingsEmpty => 'Пока нет записей';

  @override
  String get myBookingsCancelButton => 'Отменить';

  @override
  String get myBookingsCancelConfirmTitle => 'Отменить запись?';

  @override
  String get myBookingsCancelConfirmMessage => 'Это действие нельзя отменить';

  @override
  String get myBookingsStatusPending => 'Ожидание';

  @override
  String get myBookingsStatusConfirmed => 'Подтверждена';

  @override
  String get myBookingsStatusCancelled => 'Отменена';

  @override
  String get myBookingsStatusCompleted => 'Завершена';

  @override
  String get favoritesTitle => 'Избранные врачи';

  @override
  String get favoritesEmpty => 'Пока нет избранных врачей';

  @override
  String get profileTitle => 'Профиль';

  @override
  String get profileNameLabel => 'Имя';

  @override
  String get profileSaveButton => 'Сохранить';

  @override
  String get profileSavedMessage => 'Сохранено';

  @override
  String get profileLogoutButton => 'Выйти';

  @override
  String get profileLogoutConfirm => 'Выйти из аккаунта?';

  @override
  String get profileLanguage => 'Язык';

  @override
  String get doctorPanelDashboardTitle => 'Кабинет';

  @override
  String get doctorPanelNoProfileLinked =>
      'К этому аккаунту не привязан профиль врача';

  @override
  String get doctorPanelAvailabilityTitle => 'Расписание';

  @override
  String get doctorPanelAddSlot => 'Добавить день';

  @override
  String get doctorPanelDayOfWeek => 'День недели';

  @override
  String get doctorPanelStartTime => 'Время начала';

  @override
  String get doctorPanelEndTime => 'Время окончания';

  @override
  String get doctorPanelSlotMinutes => 'Длительность приёма (мин)';

  @override
  String get doctorPanelSaveAvailability => 'Сохранить расписание';

  @override
  String get doctorPanelReplaceConfirmTitle => 'Расписание будет заменено';

  @override
  String get doctorPanelReplaceConfirmMessage =>
      'Старое расписание будет полностью заменено новым. Продолжить?';

  @override
  String get doctorPanelBookingsTitle => 'Записи';

  @override
  String get doctorPanelPatientLabel => 'Пациент';

  @override
  String get doctorPanelNoBookings => 'Пока нет записей';
}
