class ClinicService {
  final String id;
  final String name;
  final int price;

  const ClinicService({required this.id, required this.name, required this.price});

  factory ClinicService.fromJson(Map<String, dynamic> json) => ClinicService(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        price: (json['price'] as num?)?.toInt() ?? 0,
      );
}
