// Small date and lookup helpers shared by the pages.

/** Today's date as YYYY-MM-DD. */
export const today = () => new Date().toISOString().slice(0, 10);

/** Add (or subtract) days from a YYYY-MM-DD date string. */
export const addDays = (date: string, days: number) => {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Find a record by id in a list and return its name (or "-"). */
export const nameOf = (list: any[], id: any) => list.find((item) => item.id == id)?.name ?? '-';
