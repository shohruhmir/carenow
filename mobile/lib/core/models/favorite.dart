import 'branch.dart';

/// The doctor shape nested under GET /favorites/me — partial clinic/branch
/// selects, distinct from the full [Doctor] model used elsewhere.
class FavoriteDoctor {
  final String id;
  final String name;
  final String specialty;
  final double rating;
  final int reviewsCount;
  final int experienceYrs;
  final ClinicRef? clinic;
  final BranchRef? branch;

  const FavoriteDoctor({
    required this.id,
    required this.name,
    required this.specialty,
    required this.rating,
    required this.reviewsCount,
    required this.experienceYrs,
    this.clinic,
    this.branch,
  });

  factory FavoriteDoctor.fromJson(Map<String, dynamic> json) => FavoriteDoctor(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        specialty: json['specialty'] as String? ?? '',
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        reviewsCount: (json['reviewsCount'] as num?)?.toInt() ?? 0,
        experienceYrs: (json['experienceYrs'] as num?)?.toInt() ?? 0,
        clinic: json['clinic'] is Map<String, dynamic> ? ClinicRef.fromJson(json['clinic'] as Map<String, dynamic>) : null,
        branch: json['branch'] is Map<String, dynamic> ? BranchRef.fromJson(json['branch'] as Map<String, dynamic>) : null,
      );
}

class Favorite {
  final String id;
  final String doctorId;
  final FavoriteDoctor? doctor;

  const Favorite({required this.id, required this.doctorId, this.doctor});

  factory Favorite.fromJson(Map<String, dynamic> json) => Favorite(
        id: json['id'] as String,
        doctorId: json['doctorId'] as String,
        doctor: json['doctor'] is Map<String, dynamic> ? FavoriteDoctor.fromJson(json['doctor'] as Map<String, dynamic>) : null,
      );
}
