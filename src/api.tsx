// API client, activity/notification helpers, the useList data hook and the loading/error/empty banner.
import axios from 'axios';
import { EmptyArt } from './art';
import { useCallback, useEffect, useState } from 'react';
export const api = axios.create({ baseURL: 'http://localhost:3001' });
export const now = () => new Date().toISOString();
export const log = (action: string, user: string) =>
  api.post('/activityLogs', { action, user, at: now() });
export const notify = (employeeId: number, message: string) =>
  api.post('/notifications', { employeeId, message, read: false, at: now() });
export function useList<T = any>(res: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setL] = useState(true);
  const [error, setE] = useState('');
  const reload = useCallback(() => {
    setL(true);
    api
      .get(res)
      .then((r) => {
        setData(r.data);
        setE('');
      })
      .catch(() => setE(`Failed to load ${res}. Is JSON Server running on :3001?`))
      .finally(() => setL(false));
  }, [res]);
  useEffect(reload, [reload]);
  return { data, loading, error, reload };
}
export const State = ({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string;
  empty?: boolean;
}) =>
  loading ? (
    <p className="p-4 text-slate-500">Loading…</p>
  ) : error ? (
    <p className="p-3 bg-red-50 text-red-700 rounded">{error}</p>
  ) : empty ? (
    <div className="p-6 text-center text-slate-400">
      <EmptyArt />
      Nothing here yet.
    </div>
  ) : null;
