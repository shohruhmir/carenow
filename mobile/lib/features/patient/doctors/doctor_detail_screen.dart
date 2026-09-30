import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/repository.dart';
import '../../../core/models/availability.dart';
import '../../../core/models/doctor.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class DoctorDetailScreen extends ConsumerStatefulWidget {
  final String doctorId;
  const DoctorDetailScreen({super.key, required this.doctorId});

  @override
  ConsumerState<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends ConsumerState<DoctorDetailScreen> {
  late Future<Doctor> _doctorFuture;
  late Future<List<DaySlot>> _slotsFuture;
  DateTime _selectedDate = DateTime.now();
  String? _selectedTime;
  bool? _isFavorite;
  bool _booking = false;

  @override
  void initState() {
    super.initState();
    final repo = ref.read(apiRepositoryProvider);
    _doctorFuture = repo.fetchDoctor(widget.doctorId);
    _slotsFuture = repo.fetchDoctorAvailability(widget.doctorId, _selectedDate);
    _loadFavoriteState();
  }

  Future<void> _loadFavoriteState() async {
    try {
      final favorites = await ref.read(apiRepositoryProvider).myFavorites();
      if (mounted) setState(() => _isFavorite = favorites.any((f) => f.doctorId == widget.doctorId));
    } catch (_) {
      // Not logged in yet or transient error — leave the favorite button hidden.
    }
  }

  Future<void> _toggleFavorite() async {
    final repo = ref.read(apiRepositoryProvider);
    final wasFavorite = _isFavorite ?? false;
    setState(() => _isFavorite = !wasFavorite);
    try {
      if (wasFavorite) {
        await repo.removeFavorite(widget.doctorId);
      } else {
        await repo.addFavorite(widget.doctorId);
      }
    } catch (_) {
      if (mounted) setState(() => _isFavorite = wasFavorite);
    }
  }

  void _pickDate(DateTime date) {
    setState(() {
      _selectedDate = date;
      _selectedTime = null;
      _slotsFuture = ref.read(apiRepositoryProvider).fetchDoctorAvailability(widget.doctorId, date);
    });
  }

  Future<void> _book(Doctor doctor) async {
    final t = AppLocalizations.of(context)!;
    if (_selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.bookingSelectSlotFirst)));
      return;
    }
    final dateLabel = DateFormat.yMMMd().format(_selectedDate);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.bookingConfirmTitle),
        content: Text(t.bookingConfirmMessage(doctor.name, dateLabel, _selectedTime!)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(t.commonCancel)),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(t.bookingConfirmButton)),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _booking = true);
    try {
      await ref.read(apiRepositoryProvider).createBooking(doctorId: widget.doctorId, date: _selectedDate, time: _selectedTime!);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.bookingSuccessMessage)));
      setState(() {
        _selectedTime = null;
        _slotsFuture = ref.read(apiRepositoryProvider).fetchDoctorAvailability(widget.doctorId, _selectedDate);
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      final message = e.statusCode == 409 || e.statusCode == 400 ? t.bookingSlotTakenError : friendlyErrorMessage(context, e);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _booking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(t.doctorsTitle),
        actions: [
          if (_isFavorite != null)
            IconButton(
              icon: Icon(_isFavorite! ? Icons.favorite : Icons.favorite_border),
              tooltip: _isFavorite! ? t.doctorDetailFavoriteRemove : t.doctorDetailFavoriteAdd,
              onPressed: _toggleFavorite,
            ),
        ],
      ),
      body: FutureBuilder<Doctor>(
        future: _doctorFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(
              message: friendlyErrorMessage(context, snapshot.error!),
              onRetry: () => setState(() => _doctorFuture = ref.read(apiRepositoryProvider).fetchDoctor(widget.doctorId)),
            );
          }
          final doctor = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(doctor.name, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text('${doctor.specialty} · ${t.doctorDetailExperience(doctor.experienceYrs.toString())}'),
              const SizedBox(height: 8),
              Row(children: [
                const Icon(Icons.star, size: 18, color: Colors.amber),
                const SizedBox(width: 4),
                Text('${doctor.rating.toStringAsFixed(1)} · ${t.doctorDetailReviews(doctor.reviewsCount)}'),
              ]),
              if (doctor.clinic != null) ...[
                const SizedBox(height: 4),
                Text(doctor.clinic!.name, style: Theme.of(context).textTheme.bodyMedium),
              ],
              if (doctor.branch != null) ...[
                const SizedBox(height: 2),
                Text(doctor.branch!.address, style: Theme.of(context).textTheme.bodySmall),
              ],
              const Divider(height: 32),
              Text(t.doctorDetailAvailabilityTitle, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              _DatePicker(selectedDate: _selectedDate, onSelect: _pickDate),
              const SizedBox(height: 12),
              FutureBuilder<List<DaySlot>>(
                future: _slotsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: LoadingView());
                  }
                  if (snapshot.hasError) {
                    return Text(friendlyErrorMessage(context, snapshot.error!));
                  }
                  final slots = (snapshot.data ?? []).where((s) => s.available).toList();
                  if (slots.isEmpty) {
                    return EmptyView(message: t.doctorDetailNoSlots, icon: Icons.event_busy_outlined);
                  }
                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: slots.map((s) {
                      final selected = _selectedTime == s.time;
                      return ChoiceChip(
                        label: Text(s.time),
                        selected: selected,
                        onSelected: (_) => setState(() => _selectedTime = s.time),
                      );
                    }).toList(),
                  );
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _booking ? null : () => _book(doctor),
                child: _booking
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(t.doctorDetailBookButton),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _DatePicker extends StatelessWidget {
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelect;
  const _DatePicker({required this.selectedDate, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final days = List.generate(14, (i) => DateTime.now().add(Duration(days: i)));
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: days.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final day = days[index];
          final selected = day.year == selectedDate.year && day.month == selectedDate.month && day.day == selectedDate.day;
          return ChoiceChip(
            label: SizedBox(
              width: 48,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(DateFormat.E().format(day)),
                  Text(DateFormat.d().format(day)),
                ],
              ),
            ),
            selected: selected,
            onSelected: (_) => onSelect(day),
          );
        },
      ),
    );
  }
}
