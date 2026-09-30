// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'CareNow';

  @override
  String get navDoctors => 'Doctors';

  @override
  String get navClinics => 'Clinics';

  @override
  String get navBookings => 'Bookings';

  @override
  String get navFavorites => 'Favorites';

  @override
  String get navProfile => 'Profile';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonSave => 'Save';

  @override
  String get commonOk => 'OK';

  @override
  String get commonLoading => 'Loading…';

  @override
  String get commonNetworkError =>
      'Can\'t reach the server. Check your internet connection.';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonSearch => 'Search';

  @override
  String get authLoginTitle => 'Sign in';

  @override
  String get authPhoneLabel => 'Phone number';

  @override
  String get authPhoneHint => '+998 90 123 45 67';

  @override
  String get authContinueButton => 'Continue';

  @override
  String get authOrDivider => 'or';

  @override
  String get authGoogleButton => 'Continue with Google';

  @override
  String get authOtpTitle => 'Enter the code';

  @override
  String authOtpSubtitle(String phone) {
    return 'Enter the 4-digit code sent to $phone';
  }

  @override
  String get authOtpLabel => 'SMS code';

  @override
  String get authVerifyButton => 'Verify';

  @override
  String get authResendCode => 'Resend code';

  @override
  String authDevCodeHint(String code) {
    return 'Dev mode: code is $code';
  }

  @override
  String get authInvalidCode => 'Invalid or expired code';

  @override
  String get authInvalidPhone => 'Enter a valid phone number';

  @override
  String get doctorsTitle => 'Doctors';

  @override
  String get doctorsSearchHint => 'Search by name or specialty';

  @override
  String get doctorsEmpty => 'No doctors added yet';

  @override
  String get doctorsSortRating => 'By rating';

  @override
  String get doctorsSortExperience => 'By experience';

  @override
  String doctorDetailExperience(String years) {
    return '$years yrs experience';
  }

  @override
  String doctorDetailReviews(int n) {
    return '$n reviews';
  }

  @override
  String get doctorDetailBookButton => 'Book';

  @override
  String get doctorDetailAvailabilityTitle => 'Available slots';

  @override
  String get doctorDetailNoSlots => 'No free slots on this day';

  @override
  String get doctorDetailSelectDate => 'Select a date';

  @override
  String get doctorDetailFavoriteAdd => 'Add to favorites';

  @override
  String get doctorDetailFavoriteRemove => 'Remove from favorites';

  @override
  String get clinicsTitle => 'Clinics';

  @override
  String get clinicsSearchHint => 'Search by clinic name';

  @override
  String get clinicsFilterAll => 'All';

  @override
  String get clinicsFilter247 => 'Open 24/7';

  @override
  String get clinicsFilterKids => 'Has kids\' department';

  @override
  String get clinicsFilterNetwork => 'Network (many branches)';

  @override
  String get clinicsFilterTopRated => 'Top rated';

  @override
  String get clinicsEmpty => 'No clinics found';

  @override
  String get clinicsMapButton => 'View on map';

  @override
  String clinicsDoctorsCount(int n) {
    return '$n doctors';
  }

  @override
  String get clinicDetailTabBranches => 'Branches';

  @override
  String get clinicDetailTabDoctors => 'Doctors';

  @override
  String get clinicDetailTabServices => 'Services';

  @override
  String get clinicDetailNoReviewsYet => 'No reviews yet';

  @override
  String get mapNoKeyTitle => 'Map isn\'t available yet';

  @override
  String get mapNoKeyMessage =>
      'The Yandex MapKit key isn\'t configured. You can keep browsing the clinic list below.';

  @override
  String get mapMyLocation => 'Near me';

  @override
  String mapBranchesCount(int n) {
    return '$n branches';
  }

  @override
  String get bookingConfirmTitle => 'Confirm this booking?';

  @override
  String bookingConfirmMessage(String doctor, String date, String time) {
    return '$doctor · $date · $time';
  }

  @override
  String get bookingConfirmButton => 'Book';

  @override
  String get bookingSuccessMessage => 'You\'re booked in';

  @override
  String get bookingSlotTakenError =>
      'That slot was just taken, please pick another';

  @override
  String get bookingSelectSlotFirst => 'Select a time first';

  @override
  String get myBookingsTitle => 'My bookings';

  @override
  String get myBookingsEmpty => 'No bookings yet';

  @override
  String get myBookingsCancelButton => 'Cancel';

  @override
  String get myBookingsCancelConfirmTitle => 'Cancel this booking?';

  @override
  String get myBookingsCancelConfirmMessage => 'This can\'t be undone';

  @override
  String get myBookingsStatusPending => 'Pending';

  @override
  String get myBookingsStatusConfirmed => 'Confirmed';

  @override
  String get myBookingsStatusCancelled => 'Cancelled';

  @override
  String get myBookingsStatusCompleted => 'Completed';

  @override
  String get favoritesTitle => 'Favorite doctors';

  @override
  String get favoritesEmpty => 'No favorite doctors yet';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileNameLabel => 'Name';

  @override
  String get profileSaveButton => 'Save';

  @override
  String get profileSavedMessage => 'Saved';

  @override
  String get profileLogoutButton => 'Log out';

  @override
  String get profileLogoutConfirm => 'Log out of your account?';

  @override
  String get profileLanguage => 'Language';

  @override
  String get doctorPanelDashboardTitle => 'Cabinet';

  @override
  String get doctorPanelNoProfileLinked =>
      'No doctor profile is linked to this account';

  @override
  String get doctorPanelAvailabilityTitle => 'Schedule';

  @override
  String get doctorPanelAddSlot => 'Add a day';

  @override
  String get doctorPanelDayOfWeek => 'Day of week';

  @override
  String get doctorPanelStartTime => 'Start time';

  @override
  String get doctorPanelEndTime => 'End time';

  @override
  String get doctorPanelSlotMinutes => 'Slot length (minutes)';

  @override
  String get doctorPanelSaveAvailability => 'Save schedule';

  @override
  String get doctorPanelReplaceConfirmTitle =>
      'This will replace your schedule';

  @override
  String get doctorPanelReplaceConfirmMessage =>
      'Your old schedule will be fully replaced by this one. Continue?';

  @override
  String get doctorPanelBookingsTitle => 'Bookings';

  @override
  String get doctorPanelPatientLabel => 'Patient';

  @override
  String get doctorPanelNoBookings => 'No bookings yet';
}
