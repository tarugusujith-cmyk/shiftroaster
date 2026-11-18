// Department schedules, shift allocation and rotation history.
import { State } from '../api';
import { useRosterData } from '../useRosterData';

export function Reports() {
  const roster = useRosterData();
  const T = ({ h, rows }: { h: string[]; rows: any[][] }) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          {h.map((c) => (
            <th key={c} className="p-1">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b">
            {r.map((c, j) => (
              <td key={j} className="p-1">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <State loading={roster.loading} error={roster.error} />
      <div className="card overflow-x-auto">
        <h2 className="font-semibold">Department-wise schedules</h2>
        <T
          h={['Department', 'Employees', 'Assignments']}
          rows={roster.departments.map((d) => {
            const ids = roster.employees.filter((e) => e.departmentId === d.id).map((e) => e.id);
            return [
              d.name,
              ids.length,
              roster.assignments.filter((a) => ids.includes(a.employeeId)).length,
            ];
          })}
        />
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-semibold">Shift allocation summary</h2>
        <T
          h={['Shift', 'Time', 'Assignments']}
          rows={roster.shifts.map((s) => [
            s.name,
            `${s.start}–${s.end}`,
            roster.assignments.filter((a) => a.shiftId === s.id).length,
          ])}
        />
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-semibold">Rotation history</h2>
        <T
          h={['Rule', 'Type', 'Period', 'Generated']}
          rows={roster.rules.map((r) => [
            r.name,
            r.type,
            `${r.startDate} → ${r.endDate}`,
            roster.assignments.filter((a) => a.ruleId === r.id).length,
          ])}
        />
      </div>
    </div>
  );
}
