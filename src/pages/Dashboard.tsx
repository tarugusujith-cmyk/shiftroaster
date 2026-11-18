// Admin/manager home: welcome banner, key numbers, today's roster, shift mix and activity history.
import { useList, State } from '../api';
import { useAuth } from '../auth';
import { Avatar, ShiftChip, HeroArt } from '../art';
import { today, nameOf } from '../utils';
import { useRosterData } from '../useRosterData';

export function Dashboard() {
  const roster = useRosterData();
  const { user } = useAuth();
  const t = today();
  const td = roster.assignments.filter((a) => a.date === t);
  const cards = [
    ['Total employees', roster.employees.length, '👥', 'from-indigo-500 to-violet-500'],
    ['Active shifts', roster.shifts.length, '⏰', 'from-amber-400 to-orange-500'],
    ["Today's assignments", td.length, '📌', 'from-emerald-400 to-teal-500'],
    [
      'Upcoming rotations',
      roster.rules.filter((r) => r.endDate >= t).length,
      '🔄',
      'from-pink-500 to-rose-500',
    ],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-6 text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 flex items-center overflow-hidden shadow-xl">
        <div>
          <p className="opacity-80 text-sm">{new Date().toDateString()}</p>
          <h1 className="text-2xl md:text-3xl font-bold">Hello, {user!.name.split(' ')[0]} 👋</h1>
          <p className="opacity-80 mt-1 text-sm">{td.length} shifts on today's roster.</p>
        </div>
        <HeroArt className="hidden sm:block w-56 ml-auto -my-8" />
      </div>
      <State loading={roster.loading} error={roster.error} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c[0] as string}
            className={`rounded-2xl p-4 text-white bg-gradient-to-br ${c[3]} shadow-lg hover:-translate-y-1 transition`}
          >
            <div className="text-2xl">{c[2]}</div>
            <div className="text-4xl font-extrabold">{c[1]}</div>
            <div className="text-sm opacity-90">{c[0]}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Today's roster</h2>
          {!td.length && <p className="text-sm text-slate-400">Nobody scheduled today.</p>}
          {td.map((a) => (
            <div key={a.id} className="flex items-center gap-2 py-1">
              <Avatar name={nameOf(roster.employees, a.employeeId)} />
              <span className="text-sm mr-auto">{nameOf(roster.employees, a.employeeId)}</span>
              <ShiftChip name={nameOf(roster.shifts, a.shiftId)} />
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Shift mix</h2>
          {roster.shifts.map((s) => {
            const c = roster.assignments.filter((a) => a.shiftId === s.id).length;
            return (
              <div key={s.id} className="mb-2">
                <div className="flex justify-between text-xs">
                  <ShiftChip name={s.name} />
                  <span>{c}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 mt-1">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                    style={{
                      width: `${roster.assignments.length ? (c / roster.assignments.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Activity />
    </div>
  );
}

function Activity() {
  const { data } = useList('activityLogs');
  return (
    <div className="card">
      <h2 className="font-semibold mb-2">Activity history</h2>
      {!data.length && <p className="text-slate-400 text-sm">No activity yet.</p>}
      <ul className="text-sm space-y-1">
        {[...data]
          .reverse()
          .slice(0, 15)
          .map((l: any) => (
            <li key={l.id}>
              <span className="text-slate-400">{new Date(l.at).toLocaleString()}</span> — {l.user}:{' '}
              {l.action}
            </li>
          ))}
      </ul>
    </div>
  );
}
