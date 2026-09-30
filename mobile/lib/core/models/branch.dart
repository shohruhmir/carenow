class Branch {
  final String id;
  final String name;
  final String address;
  final String phone;
  final double lat;
  final double lng;

  const Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.phone,
    required this.lat,
    required this.lng,
  });

  factory Branch.fromJson(Map<String, dynamic> json) => Branch(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        address: json['address'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
        lat: (json['lat'] as num?)?.toDouble() ?? 0,
        lng: (json['lng'] as num?)?.toDouble() ?? 0,
      );
}

/// The minimal clinic reference nested under a [Doctor] or a [Favorite].
class ClinicRef {
  final String id;
  final String slug;
  final String name;

  const ClinicRef({required this.id, required this.slug, required this.name});

  factory ClinicRef.fromJson(Map<String, dynamic> json) => ClinicRef(
        id: json['id'] as String,
        slug: json['slug'] as String? ?? '',
        name: json['name'] as String? ?? '',
      );
}

/// A partial branch reference (used where the backend only selects a few
/// fields, e.g. nested under favorites).
class BranchRef {
  final String id;
  final String name;
  final String address;

  const BranchRef({required this.id, required this.name, required this.address});

  factory BranchRef.fromJson(Map<String, dynamic> json) => BranchRef(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        address: json['address'] as String? ?? '',
      );
}
