import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/repository.dart';
import '../../core/models/availability.dart';
import '../../core/widgets/state_views.dart';
import '../../l10n/generated/app_localizations.dart';

class DoctorAvailabilityScreen extends ConsumerStatefulWidget {
  const DoctorAvailabilityScreen({super.key});

  @override
  ConsumerState<DoctorAvailabilityScreen> createState() => _DoctorAvailabilityScreenState();
}

class _DoctorAvailabilityScreenState extends ConsumerState<DoctorAvailabilityScreen> {
  late Future<List<AvailabilitySlot>> _future;
  List<AvailabilitySlot>? _slots;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<AvailabilitySlot>> _load() async {
    final slots = await ref.read(apiRepositoryProvider).doctorPortalAvailability();
    if (mounted) setState(() => _slots = List.of(slots));
    return slots;
  }

  void _addSlot() {
    setState(() {
      _slots = [...?_slots, const AvailabilitySlot(dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotMinutes: 30)];
    });
  }

  void _removeSlot(int index) {
    setState(() {
      final updated = List.of(_slots!);
      updated.removeAt(index);
      _slots = updated;
    });
  }

  void _updateSlot(int index, AvailabilitySlot slot) {
    setState(() {
      final updated = List.of(_slots!);
      updated[index] = slot;
      _slots = updated;
    });
  }

  Future<void> _save() async {
    final t = AppLocalizations.of(context)!;
    if (_slots == null || _slots!.isEmpty) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.doctorPanelReplaceConfirmTitle),
        content: Text(t.doctorPanelReplaceConfirmMessage),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(t.commonCancel)),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(t.commonConfirm)),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _saving = true);
    try {
      final saved = await ref.read(apiRepositoryProvider).doctorPortalSetAvailability(_slots!);
      if (mounted) {
        setState(() => _slots = saved);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.profileSavedMessage)));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(context, e))));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  static const _weekdayKeys = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']; // 0=Sunday..6=Saturday

  Future<void> _pickTime(BuildContext context, String initial, ValueChanged<String> onPicked) async {
    final parts = initial.split(':');
    final initialTime = TimeOfDay(hour: int.tryParse(parts[0]) ?? 9, minute: int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0);
    final picked = await showTimePicker(context: context, initialTime: initialTime);
    if (picked != null) {
      onPicked('${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(t.doctorPanelAvailabilityTitle),
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: _slots == null ? null : _addSlot)],
      ),
      body: FutureBuilder<List<AvailabilitySlot>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting && _slots == null) return const LoadingView();
          if (snapshot.hasError && _slots == null) {
            return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: () => setState(() => _future = _load()));
          }
          final slots = _slots ?? [];
          return Column(
            children: [
              Expanded(
                child: slots.isEmpty
                    ? EmptyView(message: t.doctorPanelAddSlot, icon: Icons.schedule_outlined)
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: slots.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final slot = slots[index];
                          return Card(
                            margin: EdgeInsets.zero,
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(children: [
                                    Expanded(
                                      child: DropdownButtonFormField<int>(
                                        initialValue: slot.dayOfWeek,
                                        decoration: InputDecoration(labelText: t.doctorPanelDayOfWeek),
                                        items: List.generate(7, (i) => DropdownMenuItem(value: i, child: Text(_weekdayKeys[i]))),
                                        onChanged: (value) {
                                          if (value != null) {
                                            _updateSlot(index, AvailabilitySlot(id: slot.id, dayOfWeek: value, startTime: slot.startTime, endTime: slot.endTime, slotMinutes: slot.slotMinutes));
                                          }
                                        },
                                      ),
                                    ),
                                    IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => _removeSlot(index)),
                                  ]),
                                  const SizedBox(height: 8),
                                  Row(children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () => _pickTime(context, slot.startTime, (v) {
                                          _updateSlot(index, AvailabilitySlot(id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: v, endTime: slot.endTime, slotMinutes: slot.slotMinutes));
                                        }),
                                        child: Text('${t.doctorPanelStartTime}: ${slot.startTime}'),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () => _pickTime(context, slot.endTime, (v) {
                                          _updateSlot(index, AvailabilitySlot(id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: v, slotMinutes: slot.slotMinutes));
                                        }),
                                        child: Text('${t.doctorPanelEndTime}: ${slot.endTime}'),
                                      ),
                                    ),
                                  ]),
                                  const SizedBox(height: 8),
                                  TextFormField(
                                    initialValue: slot.slotMinutes.toString(),
                                    keyboardType: TextInputType.number,
                                    decoration: InputDecoration(labelText: t.doctorPanelSlotMinutes),
                                    onChanged: (v) {
                                      final minutes = int.tryParse(v);
                                      if (minutes != null && minutes > 0) {
                                        _updateSlot(index, AvailabilitySlot(id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, slotMinutes: minutes));
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton(
                  onPressed: _saving || slots.isEmpty ? null : _save,
                  child: _saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t.doctorPanelSaveAvailability),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
