/// A weekly recurring availability rule for a doctor.
class AvailabilitySlot {
  final String? id;
  final int dayOfWeek; // 0=Sunday .. 6=Saturday (matches JS Date.getDay())
  final String startTime; // "HH:mm"
  final String endTime; // "HH:mm"
  final int slotMinutes;

  const AvailabilitySlot({
    this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.slotMinutes,
  });

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) => AvailabilitySlot(
        id: json['id'] as String?,
        dayOfWeek: (json['dayOfWeek'] as num).toInt(),
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
        slotMinutes: (json['slotMinutes'] as num).toInt(),
      );

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'startTime': startTime,
        'endTime': endTime,
        'slotMinutes': slotMinutes,
      };
}

/// A single bookable time on one specific day, from
/// GET /doctors/:id/availability?date=.
class DaySlot {
  final String time; // "HH:mm"
  final bool available;

  const DaySlot({required this.time, required this.available});

  factory DaySlot.fromJson(Map<String, dynamic> json) => DaySlot(
        time: json['time'] as String,
        available: json['available'] as bool? ?? false,
      );
}
