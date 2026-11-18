// Day / week / month roster grid, filterable by department.
import { useState } from 'react';
import { State } from '../api';
import { Avatar, ShiftChip } from '../art';
import { today, addDays, nameOf } from '../utils';
import { useRosterData } from '../useRosterData';

export function Calendar() {
  const roster = useRosterData();
  const [view, setView] = useState('week');
  const [start, setStart] = useState(today());
  const [dep, setDep] = useState('');
  const n = view === 'day' ? 1 : view === 'week' ? 7 : 31;
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const emps = roster.employees.filter((e) => !dep || e.departmentId == dep);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Roster Calendar</h1>
      <div className="flex flex-wrap gap-2">
        {['day', 'week', 'month'].map((v) => (
          <button key={v} className={view === v ? 'btn' : 'btn2'} onClick={() => setView(v)}>
            {v}
          </button>
        ))}
        <input
          type="date"
          className="inp !w-auto"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <select className="inp !w-auto" value={dep} onChange={(e) => setDep(e.target.value)}>
          <option value="">All departments</option>
          {roster.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <State loading={roster.loading} error={roster.error} />
      <div className="card overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="p-1 text-left">Employee</th>
              {days.map((d) => (
                <th key={d} className="p-1">
                  {d.slice(5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emps.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-1 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Avatar name={e.name} size={24} />
                    {e.name}
                  </span>
                </td>
                {days.map((d) => {
                  const a = roster.assignments.find((a) => a.employeeId === e.id && a.date === d);
                  return (
                    <td key={d} className={`p-1 text-center `}>
                      {a && <ShiftChip name={nameOf(roster.shifts, a.shiftId)} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
