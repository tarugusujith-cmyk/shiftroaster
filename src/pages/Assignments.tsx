// Assign employees to shifts with duplicate-date checks, filters, sorting and status updates.
import { useState } from 'react';
import { api, log, notify, State } from '../api';
import { useAuth } from '../auth';
import { Avatar, ShiftChip } from '../art';
import { nameOf } from '../utils';
import { useRosterData } from '../useRosterData';

export function Assignments() {
  const { user } = useAuth();
  const roster = useRosterData();
  const [f, setF] = useState<any>({ employeeId: '', shiftId: '', date: '', status: 'scheduled' });
  const [msg, setMsg] = useState('');
  const [fl, setFl] = useState({ emp: '', dep: '', shift: '', date: '', status: '', asc: true });
  const submit = async () => {
    if (!f.employeeId || !f.shiftId || !f.date)
      return setMsg('Error: employee, shift and date are required');
    if (isNaN(Date.parse(f.date))) return setMsg('Error: invalid date');
    const dup = roster.assignments.find(
      (a) => a.employeeId == f.employeeId && a.date === f.date && a.id !== f.id,
    );
    if (dup) return setMsg('Error: employee already has a shift on this date (overlap)');
    try {
      const b = { ...f, employeeId: +f.employeeId, shiftId: +f.shiftId };
      f.id ? await api.put(`/assignments/${f.id}`, b) : await api.post('/assignments', b);
      await log(
        `${f.id ? 'Updated' : 'Assigned'} ${nameOf(roster.employees, b.employeeId)} to ${nameOf(roster.shifts, b.shiftId)} on ${b.date}`,
        user!.name,
      );
      await notify(
        b.employeeId,
        `New assignment: ${nameOf(roster.shifts, b.shiftId)} on ${b.date}`,
      );
      setMsg('Saved successfully');
      setF({ employeeId: '', shiftId: '', date: '', status: 'scheduled' });
      roster.reload();
    } catch {
      setMsg('Error: save failed');
    }
  };
  const setStatus = async (a: any, status: string) => {
    await api.patch(`/assignments/${a.id}`, { status });
    await log(`Status of #${a.id} → ${status}`, user!.name);
    roster.reload();
  };
  const del = async (a: any) => {
    await api.delete(`/assignments/${a.id}`);
    await log(`Removed assignment #${a.id}`, user!.name);
    roster.reload();
  };
  const rows = roster.assignments
    .filter(
      (a) =>
        (!fl.emp || a.employeeId == fl.emp) &&
        (!fl.shift || a.shiftId == fl.shift) &&
        (!fl.date || a.date === fl.date) &&
        (!fl.status || a.status === fl.status) &&
        (!fl.dep || roster.employees.find((e) => e.id == a.employeeId)?.departmentId == fl.dep),
    )
    .sort((a, b) => a.date.localeCompare(b.date) * (fl.asc ? 1 : -1));
  const sel = (v: any, set: (v: string) => void, l: any[], ph: string) => (
    <select className="inp !w-auto" value={v} onChange={(e) => set(e.target.value)}>
      <option value="">{ph}</option>
      {l.map((o) => (
        <option key={o.id ?? o} value={o.id ?? o}>
          {o.name ?? o}
        </option>
      ))}
    </select>
  );
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Shift Assignment</h1>
      <div className="card flex flex-wrap gap-2 items-end">
        {sel(
          f.employeeId,
          (v) => setF({ ...f, employeeId: v }),
          roster.employees.filter((e) => e.status === 'active'),
          'Employee',
        )}
        {sel(f.shiftId, (v) => setF({ ...f, shiftId: v }), roster.shifts, 'Shift')}
        <input
          type="date"
          className="inp !w-auto"
          value={f.date}
          onChange={(e) => setF({ ...f, date: e.target.value })}
        />
        {sel(
          f.status,
          (v) => setF({ ...f, status: v }),
          ['scheduled', 'confirmed', 'completed', 'cancelled'],
          'Status',
        )}
        <button className="btn" onClick={submit}>
          {f.id ? 'Update' : 'Assign'}
        </button>
        {f.id && (
          <button
            className="btn2"
            onClick={() => setF({ employeeId: '', shiftId: '', date: '', status: 'scheduled' })}
          >
            Cancel
          </button>
        )}
      </div>
      {msg && (
        <p
          className={`p-2 rounded text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
        >
          {msg}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {sel(fl.emp, (v) => setFl({ ...fl, emp: v }), roster.employees, 'All employees')}
        {sel(fl.dep, (v) => setFl({ ...fl, dep: v }), roster.departments, 'All departments')}
        {sel(fl.shift, (v) => setFl({ ...fl, shift: v }), roster.shifts, 'All shifts')}
        {sel(
          fl.status,
          (v) => setFl({ ...fl, status: v }),
          ['scheduled', 'confirmed', 'completed', 'cancelled'],
          'Any status',
        )}
        <input
          type="date"
          className="inp !w-auto"
          value={fl.date}
          onChange={(e) => setFl({ ...fl, date: e.target.value })}
        />
        <button className="btn2" onClick={() => setFl({ ...fl, asc: !fl.asc })}>
          Date {fl.asc ? '▲' : '▼'}
        </button>
      </div>
      <State loading={roster.loading} error={roster.error} empty={!rows.length} />
      {!!rows.length && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">{a.date}</td>
                  <td>
                    <span className="flex items-center gap-2">
                      <Avatar name={nameOf(roster.employees, a.employeeId)} size={24} />
                      {nameOf(roster.employees, a.employeeId)}
                    </span>
                  </td>
                  <td>
                    <ShiftChip name={nameOf(roster.shifts, a.shiftId)} />
                  </td>
                  <td>
                    <select
                      className="inp !w-auto"
                      value={a.status}
                      onChange={(e) => setStatus(a, e.target.value)}
                    >
                      {['scheduled', 'confirmed', 'completed', 'cancelled'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right space-x-1">
                    <button className="btn2" onClick={() => setF(a)}>
                      Edit
                    </button>
                    <button className="btn2 text-red-600" onClick={() => del(a)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
