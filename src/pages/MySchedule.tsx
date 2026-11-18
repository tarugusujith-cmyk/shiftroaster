// The logged-in employee's own shifts.
import { State } from '../api';
import { useAuth } from '../auth';
import { today } from '../utils';
import { useRosterData } from '../useRosterData';

export function MySchedule() {
  const { user } = useAuth();
  const roster = useRosterData();
  const t = today();
  const mine = roster.assignments
    .filter((a) => a.employeeId === user!.employeeId)
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Schedule</h1>
      <State loading={roster.loading} error={roster.error} empty={!mine.length} />
      {mine.map((a) => {
        const s = roster.shifts.find((s) => s.id == a.shiftId);
        return (
          <div key={a.id} className={`card text-sm ${a.date < t ? 'opacity-60' : ''}`}>
            <b>{a.date}</b> — {s?.name} {s?.start}–{s?.end} (break {s?.breakMins}m) ·{' '}
            <i>{a.status}</i>
          </div>
        );
      })}
    </div>
  );
}
