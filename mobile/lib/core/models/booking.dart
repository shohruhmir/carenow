import 'doctor.dart';
import 'enums.dart';

class PatientRef {
  final String id;
  final String? phone;
  final String? name;

  const PatientRef({required this.id, this.phone, this.name});

  factory PatientRef.fromJson(Map<String, dynamic> json) => PatientRef(
        id: json['id'] as String,
        phone: json['phone'] as String?,
        name: json['name'] as String?,
      );
}

class Booking {
  final String id;
  final String patientId;
  final String doctorId;
  final String? serviceId;
  final DateTime date;
  final String time;
  final BookingStatus status;
  final Doctor? doctor;
  final PatientRef? patient;

  const Booking({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.date,
    required this.time,
    required this.status,
    this.serviceId,
    this.doctor,
    this.patient,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] as String,
        patientId: json['patientId'] as String? ?? '',
        doctorId: json['doctorId'] as String,
        serviceId: json['serviceId'] as String?,
        date: DateTime.parse(json['date'] as String),
        time: json['time'] as String,
        status: bookingStatusFromJson(json['status'] as String?),
        doctor: json['doctor'] is Map<String, dynamic> ? Doctor.fromJson(json['doctor'] as Map<String, dynamic>) : null,
        patient: json['patient'] is Map<String, dynamic> ? PatientRef.fromJson(json['patient'] as Map<String, dynamic>) : null,
      );
}
