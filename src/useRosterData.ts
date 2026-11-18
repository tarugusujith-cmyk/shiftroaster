import { useList } from './api';

/** Loads everything the roster pages need in one place. */
export function useRosterData() {
  const employees = useList('employees');
  const shifts = useList('shifts');
  const assignments = useList('assignments');
  const departments = useList('departments');
  const rules = useList('rotationRules');
  const all = [employees, shifts, assignments, departments, rules];

  return {
    employees: employees.data,
    shifts: shifts.data,
    assignments: assignments.data,
    departments: departments.data,
    rules: rules.data,
    loading: all.some((l) => l.loading),
    error: all.map((l) => l.error).find(Boolean) || '',
    reload: () => {
      assignments.reload();
      rules.reload();
    },
  };
}
