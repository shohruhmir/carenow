import 'enums.dart';

class User {
  final String id;
  final String? phone;
  final String? name;
  final Role role;
  final String? email;

  const User({
    required this.id,
    required this.role,
    this.phone,
    this.name,
    this.email,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        phone: json['phone'] as String?,
        name: json['name'] as String?,
        role: roleFromJson(json['role'] as String?),
        email: json['email'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'phone': phone,
        'name': name,
        'role': role.name,
        'email': email,
      };

  User copyWith({String? name}) => User(
        id: id,
        phone: phone,
        name: name ?? this.name,
        role: role,
        email: email,
      );
}
