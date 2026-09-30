enum Role { patient, clinicAdmin, doctor, superAdmin, unknown }

// Accepts both the backend's SCREAMING_CASE values and this app's own
// cached enum-name format (User.toJson round-trips through secure storage).
Role roleFromJson(String? value) {
  switch (value) {
    case 'PATIENT':
    case 'patient':
      return Role.patient;
    case 'CLINIC_ADMIN':
    case 'clinicAdmin':
      return Role.clinicAdmin;
    case 'DOCTOR':
    case 'doctor':
      return Role.doctor;
    case 'SUPER_ADMIN':
    case 'superAdmin':
      return Role.superAdmin;
    default:
      return Role.unknown;
  }
}

enum BookingStatus { pending, confirmed, cancelled, completed, unknown }

BookingStatus bookingStatusFromJson(String? value) {
  switch (value) {
    case 'PENDING':
      return BookingStatus.pending;
    case 'CONFIRMED':
      return BookingStatus.confirmed;
    case 'CANCELLED':
      return BookingStatus.cancelled;
    case 'COMPLETED':
      return BookingStatus.completed;
    default:
      return BookingStatus.unknown;
  }
}
