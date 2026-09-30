import 'branch.dart';
import 'doctor.dart';
import 'service.dart';

/// GET /clinics list item — doctors are nested as `{specialty}` only.
class ClinicSummary {
  final String id;
  final String slug;
  final String name;
  final String? desc;
  final double rating;
  final bool is247;
  final List<Branch> branches;
  final int doctorCount;
  final List<String> doctorSpecialties;

  const ClinicSummary({
    required this.id,
    required this.slug,
    required this.name,
    required this.rating,
    required this.is247,
    required this.branches,
    required this.doctorCount,
    required this.doctorSpecialties,
    this.desc,
  });

  factory ClinicSummary.fromJson(Map<String, dynamic> json) {
    final doctors = (json['doctors'] as List<dynamic>?) ?? const [];
    final count = json['_count'] as Map<String, dynamic>?;
    return ClinicSummary(
      id: json['id'] as String,
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? '',
      desc: json['desc'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      is247: json['is247'] as bool? ?? false,
      branches: ((json['branches'] as List<dynamic>?) ?? const [])
          .map((e) => Branch.fromJson(e as Map<String, dynamic>))
          .toList(),
      doctorCount: (count?['doctors'] as num?)?.toInt() ?? doctors.length,
      doctorSpecialties: doctors
          .map((e) => ClinicDoctorSpecialty.fromJson(e as Map<String, dynamic>).specialty)
          .toList(),
    );
  }

  bool get hasKidsSpecialist =>
      doctorSpecialties.any((s) => s.toLowerCase().contains('bolalar'));
}

/// GET /clinics/:slug — full nested branches/doctors/services.
class ClinicDetail {
  final String id;
  final String slug;
  final String name;
  final String? desc;
  final double rating;
  final bool is247;
  final List<Branch> branches;
  final List<Doctor> doctors;
  final List<ClinicService> services;

  const ClinicDetail({
    required this.id,
    required this.slug,
    required this.name,
    required this.rating,
    required this.is247,
    required this.branches,
    required this.doctors,
    required this.services,
    this.desc,
  });

  factory ClinicDetail.fromJson(Map<String, dynamic> json) => ClinicDetail(
        id: json['id'] as String,
        slug: json['slug'] as String? ?? '',
        name: json['name'] as String? ?? '',
        desc: json['desc'] as String?,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        is247: json['is247'] as bool? ?? false,
        branches: ((json['branches'] as List<dynamic>?) ?? const [])
            .map((e) => Branch.fromJson(e as Map<String, dynamic>))
            .toList(),
        doctors: ((json['doctors'] as List<dynamic>?) ?? const [])
            .map((e) => Doctor.fromJson(e as Map<String, dynamic>))
            .toList(),
        services: ((json['services'] as List<dynamic>?) ?? const [])
            .map((e) => ClinicService.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
