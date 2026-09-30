import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../models/availability.dart';
import '../models/booking.dart';
import '../models/clinic.dart';
import '../models/doctor.dart';
import '../models/favorite.dart';
import '../models/user.dart';
import 'api_client.dart';

final _dateFmt = DateFormat('yyyy-MM-dd');
String formatApiDate(DateTime d) => _dateFmt.format(d);

/// One class covering every backend module this app talks to — see
/// backend/src/{auth,doctors,clinics,bookings,favorites,doctor-portal}.
class ApiRepository {
  final ApiClient _api;
  ApiRepository(this._api);

  // ---- Auth ----

  Future<Map<String, dynamic>> requestOtp(String phone) => _api.post(
        '/auth/otp/request',
        {'phone': phone},
        (data) => data as Map<String, dynamic>,
      );

  Future<(String, User)> verifyOtp(String phone, String code) => _api.post(
        '/auth/otp/verify',
        {'phone': phone, 'code': code},
        (data) => (data['token'] as String, User.fromJson(data['user'] as Map<String, dynamic>)),
      );

  Future<(String, User)> googleLogin(String accessToken) => _api.post(
        '/auth/google',
        {'accessToken': accessToken},
        (data) => (data['token'] as String, User.fromJson(data['user'] as Map<String, dynamic>)),
      );

  Future<User> me() => _api.get('/auth/me', (data) => User.fromJson(data as Map<String, dynamic>));

  Future<User> updateProfile(String name) => _api.patch(
        '/auth/me',
        {'name': name},
        (data) => User.fromJson(data as Map<String, dynamic>),
      );

  // ---- Doctors (public) ----

  Future<List<Doctor>> fetchDoctors({String? specialty, String? q}) => _api.get(
        '/doctors',
        (data) => (data as List<dynamic>).map((e) => Doctor.fromJson(e as Map<String, dynamic>)).toList(),
        query: {
          if (specialty != null && specialty.isNotEmpty) 'specialty': specialty,
          if (q != null && q.isNotEmpty) 'q': q,
        },
      );

  Future<Doctor> fetchDoctor(String id) =>
      _api.get('/doctors/$id', (data) => Doctor.fromJson(data as Map<String, dynamic>));

  Future<List<DaySlot>> fetchDoctorAvailability(String id, DateTime date) => _api.get(
        '/doctors/$id/availability',
        (data) => (data as List<dynamic>).map((e) => DaySlot.fromJson(e as Map<String, dynamic>)).toList(),
        query: {'date': formatApiDate(date)},
      );

  // ---- Clinics (public) ----

  Future<List<ClinicSummary>> fetchClinics({bool? is247, String? q}) => _api.get(
        '/clinics',
        (data) => (data as List<dynamic>).map((e) => ClinicSummary.fromJson(e as Map<String, dynamic>)).toList(),
        query: {
          if (is247 != null) 'is247': is247.toString(),
          if (q != null && q.isNotEmpty) 'q': q,
        },
      );

  Future<ClinicDetail> fetchClinic(String slug) =>
      _api.get('/clinics/$slug', (data) => ClinicDetail.fromJson(data as Map<String, dynamic>));

  // ---- Bookings (authed) ----

  Future<Booking> createBooking({required String doctorId, required DateTime date, required String time, String? serviceId}) =>
      _api.post(
        '/bookings',
        {
          'doctorId': doctorId,
          'date': formatApiDate(date),
          'time': time,
          // ignore: use_null_aware_elements
          if (serviceId != null) 'serviceId': serviceId,
        },
        (data) => Booking.fromJson(data as Map<String, dynamic>),
      );

  Future<List<Booking>> myBookings() =>
      _api.get('/bookings/me', (data) => (data as List<dynamic>).map((e) => Booking.fromJson(e as Map<String, dynamic>)).toList());

  Future<Booking> cancelBooking(String id) =>
      _api.delete('/bookings/$id', (data) => Booking.fromJson(data as Map<String, dynamic>));

  // ---- Favorites (authed) ----

  Future<List<Favorite>> myFavorites() => _api.get(
        '/favorites/me',
        (data) => (data as List<dynamic>).map((e) => Favorite.fromJson(e as Map<String, dynamic>)).toList(),
      );

  Future<void> addFavorite(String doctorId) => _api.post('/favorites/$doctorId', null, (_) {});

  Future<void> removeFavorite(String doctorId) => _api.delete('/favorites/$doctorId', (_) {});

  // ---- Doctor portal (authed, role DOCTOR) ----

  Future<Doctor> doctorPortalMe() =>
      _api.get('/doctor-portal/me', (data) => Doctor.fromJson(data as Map<String, dynamic>));

  Future<List<AvailabilitySlot>> doctorPortalAvailability() => _api.get(
        '/doctor-portal/availability',
        (data) => (data as List<dynamic>).map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>)).toList(),
      );

  Future<List<AvailabilitySlot>> doctorPortalSetAvailability(List<AvailabilitySlot> slots) => _api.post(
        '/doctor-portal/availability',
        {'slots': slots.map((s) => s.toJson()).toList()},
        (data) => (data as List<dynamic>).map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>)).toList(),
      );

  Future<List<Booking>> doctorPortalBookings() => _api.get(
        '/doctor-portal/bookings',
        (data) => (data as List<dynamic>).map((e) => Booking.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

final apiRepositoryProvider = Provider<ApiRepository>((ref) => ApiRepository(ref.watch(apiClientProvider)));
