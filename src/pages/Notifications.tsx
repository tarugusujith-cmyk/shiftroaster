// In-app notifications for the logged-in employee.
import { api, useList, State } from '../api';
import { useAuth } from '../auth';

export function Notifications() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useList('notifications');
  const mine = data.filter((n: any) => n.employeeId === user!.employeeId).reverse();
  const read = async (n: any) => {
    await api.patch(`/notifications/${n.id}`, { read: true });
    reload();
  };
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Notifications</h1>
      <State loading={loading} error={error} empty={!mine.length} />
      {mine.map((n: any) => (
        <div key={n.id} className={`card text-sm flex gap-2 ${n.read ? 'opacity-60' : ''}`}>
          <span className="mr-auto">
            {n.message}
            <br />
            <span className="text-slate-400">{new Date(n.at).toLocaleString()}</span>
          </span>
          {!n.read && (
            <button className="btn2" onClick={() => read(n)}>
              Mark read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
