import 'package:flutter_test/flutter_test.dart';

import 'package:carenow_app/core/models/booking.dart';
import 'package:carenow_app/core/models/clinic.dart';
import 'package:carenow_app/core/models/doctor.dart';
import 'package:carenow_app/core/models/enums.dart';
import 'package:carenow_app/core/models/user.dart';

void main() {
  group('User', () {
    test('parses a backend PATIENT row', () {
      final user = User.fromJson({
        'id': 'u1',
        'phone': '+998901234567',
        'name': 'Aziza',
        'role': 'PATIENT',
        'email': null,
      });
      expect(user.role, Role.patient);
      expect(user.phone, '+998901234567');
    });

    test('round-trips through local cache JSON', () {
      const user = User(id: 'u1', role: Role.doctor, name: 'Dr. X');
      final restored = User.fromJson(user.toJson());
      expect(restored.role, Role.doctor);
      expect(restored.name, 'Dr. X');
    });
  });

  group('Doctor', () {
    test('parses GET /doctors/:id shape with clinic/branch/availability', () {
      final doctor = Doctor.fromJson({
        'id': 'd1',
        'clinicId': 'c1',
        'branchId': 'b1',
        'name': 'Dr. Karimova',
        'specialty': 'Ortodont',
        'experienceYrs': 12,
        'rating': 4.9,
        'reviewsCount': 312,
        'clinic': {'id': 'c1', 'slug': 'smile-dental', 'name': 'Smile Dental'},
        'branch': {'id': 'b1', 'name': 'Bunyodkor', 'address': 'Bunyodkor 27', 'phone': '+998', 'lat': 41.3, 'lng': 69.2},
        'availability': [
          {'id': 'a1', 'dayOfWeek': 1, 'startTime': '09:00', 'endTime': '18:00', 'slotMinutes': 30},
        ],
      });
      expect(doctor.name, 'Dr. Karimova');
      expect(doctor.clinic?.name, 'Smile Dental');
      expect(doctor.branch?.address, 'Bunyodkor 27');
      expect(doctor.availability?.single.startTime, '09:00');
    });

    test('parses GET /doctors list shape without availability', () {
      final doctor = Doctor.fromJson({
        'id': 'd1',
        'clinicId': 'c1',
        'branchId': 'b1',
        'name': 'Dr. Karimova',
        'specialty': 'Ortodont',
        'experienceYrs': 12,
        'rating': 4.9,
        'reviewsCount': 312,
        'clinic': {'id': 'c1', 'slug': 'smile-dental', 'name': 'Smile Dental'},
        'branch': {'id': 'b1', 'name': 'Bunyodkor', 'address': 'Bunyodkor 27', 'phone': '+998', 'lat': 41.3, 'lng': 69.2},
      });
      expect(doctor.availability, isNull);
    });
  });

  group('ClinicSummary', () {
    test('parses GET /clinics list shape with specialty-only nested doctors', () {
      final clinic = ClinicSummary.fromJson({
        'id': 'c1',
        'slug': 'smile-dental',
        'name': 'Smile Dental',
        'desc': 'A clinic',
        'rating': 4.9,
        'is247': false,
        'branches': [
          {'id': 'b1', 'name': 'Bunyodkor', 'address': 'Addr', 'phone': '+998', 'lat': 41.3, 'lng': 69.2},
        ],
        '_count': {'doctors': 5},
        'doctors': [
          {'specialty': 'Bolalar stomatologi'},
          {'specialty': 'Ortodont'},
        ],
      });
      expect(clinic.doctorCount, 5);
      expect(clinic.hasKidsSpecialist, isTrue);
      expect(clinic.branches.single.name, 'Bunyodkor');
    });
  });

  group('Booking', () {
    test('parses a booking with nested doctor and status', () {
      final booking = Booking.fromJson({
        'id': 'bk1',
        'patientId': 'u1',
        'doctorId': 'd1',
        'serviceId': null,
        'date': '2026-08-14T00:00:00.000Z',
        'time': '14:30',
        'status': 'CONFIRMED',
        'doctor': {
          'id': 'd1',
          'clinicId': 'c1',
          'branchId': 'b1',
          'name': 'Dr. Karimova',
          'specialty': 'Ortodont',
          'experienceYrs': 12,
          'rating': 4.9,
          'reviewsCount': 312,
        },
      });
      expect(booking.status, BookingStatus.confirmed);
      expect(booking.time, '14:30');
      expect(booking.doctor?.name, 'Dr. Karimova');
    });
  });
}
