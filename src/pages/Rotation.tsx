// Create weekly/monthly rotation rules and generate assignments from them.
import { useState } from 'react';
import { api, log, notify, State } from '../api';
import { useAuth } from '../auth';
import { addDays } from '../utils';
import { useRosterData } from '../useRosterData';

export function Rotation() {
  const { user } = useAuth();
  const roster = useRosterData();
  const [msg, setMsg] = useState('');
  const [f, setF] = useState<any>({
    name: '',
    type: 'weekly',
    startDate: '',
    endDate: '',
    shiftIds: [],
    employeeIds: [],
  });
  const tog = (k: string, id: number) =>
    setF({ ...f, [k]: f[k].includes(id) ? f[k].filter((i: number) => i !== id) : [...f[k], id] });
  const create = async () => {
    if (!f.name || !f.startDate || !f.endDate || f.shiftIds.length < 1 || !f.employeeIds.length)
      return setMsg('Error: all fields, at least one shift and employee required');
    if (f.endDate < f.startDate) return setMsg('Error: end date before start date');
    try {
      await api.post('/rotationRules', f);
      await log(`Created rotation rule "${f.name}"`, user!.name);
      setMsg('Rule saved');
      setF({ ...f, name: '' });
      roster.reload();
    } catch {
      setMsg('Error: save failed');
    }
  };
  const apply = async (r: any) => {
    let n = 0;
    const days = Math.round((Date.parse(r.endDate) - Date.parse(r.startDate)) / 864e5);
    for (let d = 0; d <= days; d++) {
      const date = addDays(r.startDate, d);
      const period =
        r.type === 'weekly'
          ? Math.floor(d / 7)
          : new Date(date).getUTCFullYear() * 12 +
            new Date(date).getUTCMonth() -
            (new Date(r.startDate).getUTCFullYear() * 12 + new Date(r.startDate).getUTCMonth());
      for (let i = 0; i < r.employeeIds.length; i++) {
        const eid = r.employeeIds[i];
        if (roster.assignments.some((a) => a.employeeId === eid && a.date === date)) continue;
        await api.post('/assignments', {
          employeeId: eid,
          shiftId: r.shiftIds[(i + period) % r.shiftIds.length],
          date,
          status: 'scheduled',
          ruleId: r.id,
        });
        n++;
      }
    }
    await log(`Applied rotation "${r.name}" (${n} assignments)`, user!.name);
    for (const e of r.employeeIds)
      await notify(e, `Upcoming rotation "${r.name}" starts ${r.startDate}`);
    setMsg(`Generated ${n} assignments (existing dates skipped)`);
    roster.reload();
  };
  const del = async (r: any) => {
    await api.delete(`/rotationRules/${r.id}`);
    await log(`Deleted rule "${r.name}"`, user!.name);
    roster.reload();
  };
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Rotation Rules</h1>
      <div className="card space-y-2 text-sm">
        <div className="flex flex-wrap gap-2">
          <input
            className="inp !w-48"
            placeholder="Rule name"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
          <select
            className="inp !w-auto"
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value })}
          >
            <option>weekly</option>
            <option>monthly</option>
          </select>
          <input
            type="date"
            className="inp !w-auto"
            value={f.startDate}
            onChange={(e) => setF({ ...f, startDate: e.target.value })}
          />
          <input
            type="date"
            className="inp !w-auto"
            value={f.endDate}
            onChange={(e) => setF({ ...f, endDate: e.target.value })}
          />
        </div>
        <div>
          Shift order:{' '}
          {roster.shifts.map((s) => (
            <label key={s.id} className="mr-3">
              <input
                type="checkbox"
                checked={f.shiftIds.includes(s.id)}
                onChange={() => tog('shiftIds', s.id)}
              />{' '}
              {s.name}
            </label>
          ))}
        </div>
        <div>
          Employees:{' '}
          {roster.employees.map((e) => (
            <label key={e.id} className="mr-3">
              <input
                type="checkbox"
                checked={f.employeeIds.includes(e.id)}
                onChange={() => tog('employeeIds', e.id)}
              />{' '}
              {e.name}
            </label>
          ))}
        </div>
        <button className="btn" onClick={create}>
          Save rule
        </button>
      </div>
      {msg && (
        <p
          className={`p-2 rounded text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
        >
          {msg}
        </p>
      )}
      <State loading={roster.loading} error={roster.error} empty={!roster.rules.length} />
      {roster.rules.map((r) => (
        <div key={r.id} className="card flex flex-wrap gap-2 items-center text-sm">
          <b>{r.name}</b>
          <span>
            {r.type} · {r.startDate} → {r.endDate} · {r.shiftIds.length} shifts ·{' '}
            {r.employeeIds.length} staff
          </span>
          <span className="ml-auto space-x-1">
            <button className="btn" onClick={() => apply(r)}>
              Apply
            </button>
            <button className="btn2 text-red-600" onClick={() => del(r)}>
              Delete
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
