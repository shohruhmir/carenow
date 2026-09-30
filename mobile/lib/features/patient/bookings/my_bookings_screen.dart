import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/api/repository.dart';
import '../../../core/models/booking.dart';
import '../../../core/models/enums.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class MyBookingsScreen extends ConsumerStatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  ConsumerState<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends ConsumerState<MyBookingsScreen> {
  late Future<List<Booking>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).myBookings();
  }

  Future<void> _refresh() async {
    setState(() => _future = ref.read(apiRepositoryProvider).myBookings());
    await _future;
  }

  Future<void> _cancel(Booking booking) async {
    final t = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.myBookingsCancelConfirmTitle),
        content: Text(t.myBookingsCancelConfirmMessage),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(t.commonCancel)),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(t.commonConfirm)),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(apiRepositoryProvider).cancelBooking(booking.id);
      await _refresh();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(context, e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.myBookingsTitle)),
      body: FutureBuilder<List<Booking>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: _refresh);
          }
          final bookings = snapshot.data ?? [];
          if (bookings.isEmpty) {
            return EmptyView(message: t.myBookingsEmpty, icon: Icons.event_busy_outlined);
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) => _BookingTile(booking: bookings[i], onCancel: () => _cancel(bookings[i])),
            ),
          );
        },
      ),
    );
  }
}

class _BookingTile extends StatelessWidget {
  final Booking booking;
  final VoidCallback onCancel;
  const _BookingTile({required this.booking, required this.onCancel});

  String _statusLabel(AppLocalizations t, BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return t.myBookingsStatusPending;
      case BookingStatus.confirmed:
        return t.myBookingsStatusConfirmed;
      case BookingStatus.cancelled:
        return t.myBookingsStatusCancelled;
      case BookingStatus.completed:
        return t.myBookingsStatusCompleted;
      case BookingStatus.unknown:
        return '';
    }
  }

  Color _statusColor(BuildContext context, BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return Colors.amber;
      case BookingStatus.confirmed:
        return Colors.green;
      case BookingStatus.cancelled:
        return Colors.grey;
      case BookingStatus.completed:
        return Theme.of(context).colorScheme.primary;
      case BookingStatus.unknown:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    final canCancel = booking.status == BookingStatus.pending || booking.status == BookingStatus.confirmed;
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Expanded(child: Text(booking.doctor?.name ?? '', style: const TextStyle(fontWeight: FontWeight.w600))),
              Chip(
                label: Text(_statusLabel(t, booking.status)),
                backgroundColor: _statusColor(context, booking.status).withValues(alpha: 0.15),
                visualDensity: VisualDensity.compact,
              ),
            ]),
            const SizedBox(height: 4),
            Text('${DateFormat.yMMMd().format(booking.date)} · ${booking.time}'),
            if (booking.doctor?.clinic != null) Text(booking.doctor!.clinic!.name, style: Theme.of(context).textTheme.bodySmall),
            if (canCancel) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: onCancel, child: Text(t.myBookingsCancelButton)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
