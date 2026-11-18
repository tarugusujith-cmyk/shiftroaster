// Reusable list + add/edit/delete screen driven by a list of field definitions. Used for employees, departments and shifts.
import { useState } from 'react';
import { api, log, useList, State } from './api';
import { useAuth } from './auth';
export type F = {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'time' | 'number' | 'select';
  options?: { v: any; l: string }[];
  req?: boolean;
};
export default function Crud({
  res,
  title,
  fields,
  extraFilter,
}: {
  res: string;
  title: string;
  fields: F[];
  extraFilter?: string;
}) {
  const { user } = useAuth();
  const { data, loading, error, reload } = useList(res);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(fields[0].key);
  const [asc, setAsc] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const show = (r: any, f: F) =>
    f.options ? (f.options.find((o) => o.v == r[f.key])?.l ?? '-') : r[f.key];
  const rows = data
    .filter((r) => fields.some((f) => String(show(r, f)).toLowerCase().includes(q.toLowerCase())))
    .sort(
      (a, b) =>
        String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true }) *
        (asc ? 1 : -1),
    );
  const save = async () => {
    const e: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.req !== false && !String(edit[f.key] ?? '').trim()) e[f.key] = `${f.label} is required`;
    });
    if (edit.email && !/^\S+@\S+\.\S+$/.test(edit.email)) e.email = 'Invalid email';
    if (res === 'shifts' && edit.start && edit.start === edit.end)
      e.end = 'End must differ from start';
    setErrs(e);
    if (Object.keys(e).length) return;
    try {
      const body = { ...edit };
      fields.forEach((f) => {
        if (f.type === 'number' || f.options?.some((o) => typeof o.v === 'number'))
          body[f.key] = Number(body[f.key]);
      });
      edit.id ? await api.put(`/${res}/${edit.id}`, body) : await api.post(`/${res}`, body);
      await log(`${edit.id ? 'Updated' : 'Created'} ${res} "${body.name ?? ''}"`, user!.name);
      setEdit(null);
      setMsg('Saved successfully');
      reload();
    } catch {
      setMsg('Error: could not save');
    }
  };
  const del = async (r: any) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/${res}/${r.id}`);
      await log(`Deleted ${res} "${r.name ?? r.id}"`, user!.name);
      setMsg('Deleted');
      reload();
    } catch {
      setMsg('Error: could not delete');
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-xl font-semibold mr-auto">{title}</h1>
        <input
          className="inp !w-48"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => {
            setErrs({});
            setEdit({});
          }}
        >
          + Add
        </button>
      </div>
      {msg && (
        <p
          className={`p-2 rounded text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
        >
          {msg}
        </p>
      )}
      <State loading={loading} error={error} empty={!rows.length} />
      {!!rows.length && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                {fields.map((f) => (
                  <th
                    key={f.key}
                    className="p-2 cursor-pointer"
                    onClick={() => {
                      setAsc(sort === f.key ? !asc : true);
                      setSort(f.key);
                    }}
                  >
                    {f.label}
                    {sort === f.key ? (asc ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  {fields.map((f) => (
                    <td key={f.key} className="p-2">
                      {show(r, f)}
                    </td>
                  ))}
                  <td className="p-2 text-right space-x-1">
                    <button
                      className="btn2"
                      onClick={() => {
                        setErrs({});
                        setEdit(r);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn2 text-red-600" onClick={() => del(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card w-full max-w-md space-y-2">
            <h2 className="font-semibold">
              {edit.id ? 'Edit' : 'New'} {title}
            </h2>
            {fields.map((f) => (
              <label key={f.key} className="block text-sm">
                {f.label}
                {f.options ? (
                  <select
                    className="inp"
                    value={edit[f.key] ?? ''}
                    onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {f.options.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="inp"
                    type={f.type || 'text'}
                    value={edit[f.key] ?? ''}
                    onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                  />
                )}
                {errs[f.key] && <span className="text-red-600 text-xs">{errs[f.key]}</span>}
              </label>
            ))}
            <div className="flex justify-end gap-2">
              <button className="btn2" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
