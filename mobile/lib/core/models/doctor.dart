import 'availability.dart';
import 'branch.dart';

/// One shape used across several endpoints (GET /doctors, GET /doctors/:id,
/// nested under a Clinic detail or a Booking). Which of [clinic]/[branch]/
/// [availability] are present depends on the endpoint — all are optional.
class Doctor {
  final String id;
  final String clinicId;
  final String branchId;
  final String name;
  final String specialty;
  final int experienceYrs;
  final double rating;
  final int reviewsCount;
  final ClinicRef? clinic;
  final Branch? branch;
  final List<AvailabilitySlot>? availability;

  const Doctor({
    required this.id,
    required this.clinicId,
    required this.branchId,
    required this.name,
    required this.specialty,
    required this.experienceYrs,
    required this.rating,
    required this.reviewsCount,
    this.clinic,
    this.branch,
    this.availability,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) => Doctor(
        id: json['id'] as String,
        clinicId: json['clinicId'] as String? ?? '',
        branchId: json['branchId'] as String? ?? '',
        name: json['name'] as String? ?? '',
        specialty: json['specialty'] as String? ?? '',
        experienceYrs: (json['experienceYrs'] as num?)?.toInt() ?? 0,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        reviewsCount: (json['reviewsCount'] as num?)?.toInt() ?? 0,
        clinic: json['clinic'] is Map<String, dynamic> ? ClinicRef.fromJson(json['clinic'] as Map<String, dynamic>) : null,
        branch: json['branch'] is Map<String, dynamic> ? Branch.fromJson(json['branch'] as Map<String, dynamic>) : null,
        availability: (json['availability'] as List<dynamic>?)
            ?.map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

/// The `{specialty}`-only doctor shape nested under the GET /clinics list
/// endpoint's clinics (see clinics.controller.ts) — deliberately minimal.
class ClinicDoctorSpecialty {
  final String specialty;
  const ClinicDoctorSpecialty(this.specialty);

  factory ClinicDoctorSpecialty.fromJson(Map<String, dynamic> json) =>
      ClinicDoctorSpecialty(json['specialty'] as String? ?? '');
}
