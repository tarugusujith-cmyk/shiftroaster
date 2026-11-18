// Layout (sidebar + page area) and the route table with role access.
import { Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import { Avatar } from './art';
import { useAuth, Guard } from './auth';
import Login from './pages/Login';
import Crud from './Crud';
import { useList } from './api';
import {
  Dashboard,
  Assignments,
  Rotation,
  Calendar,
  MySchedule,
  Notifications,
  Reports,
} from './pages';
const AM = ['admin', 'manager'],
  ALL = ['admin', 'manager', 'employee'];
const nav: [string, string, string[]][] = [
  ['/', '📊 Dashboard', AM],
  ['/employees', '👥 Employees', ['admin']],
  ['/departments', '🏢 Departments', ['admin']],
  ['/shifts', '⏰ Shifts', ['admin']],
  ['/assign', '📌 Assignments', AM],
  ['/rotation', '🔄 Rotation Rules', AM],
  ['/calendar', '🗓️ Roster Calendar', AM],
  ['/my', '🙋 My Schedule', ALL],
  ['/notifications', '🔔 Notifications', ALL],
  ['/reports', '📈 Reports', AM],
];
function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-56 bg-gradient-to-b from-slate-900 via-indigo-950 to-violet-950 text-slate-100 p-4 md:min-h-screen md:sticky md:top-0 md:h-screen">
        <div className="font-extrabold text-lg mb-3 bg-gradient-to-r from-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
          🗓️ ShiftFlow
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto text-sm">
          {nav
            .filter((n) => n[2].includes(user!.role))
            .map((n) => (
              <NavLink
                key={n[0]}
                to={n[0]}
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl whitespace-nowrap transition ${isActive ? 'bg-white/15 shadow-inner font-medium' : 'hover:bg-white/10'}`
                }
              >
                {n[1]}
              </NavLink>
            ))}
        </nav>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <Avatar name={user!.name} />
          <div>
            {user!.name}
            <div className="opacity-60 capitalize">{user!.role}</div>
            <button className="underline" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
const Emp = () => {
  const d = useList('departments').data;
  return (
    <Crud
      res="employees"
      title="Employees"
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', type: 'email' },
        {
          key: 'departmentId',
          label: 'Department',
          options: d.map((x: any) => ({ v: x.id, l: x.name })),
        },
        { key: 'designation', label: 'Designation' },
        {
          key: 'status',
          label: 'Status',
          options: ['active', 'inactive'].map((v) => ({ v, l: v })),
        },
      ]}
    />
  );
};
export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route
          path="/"
          element={
            <Guard roles={AM}>
              <Dashboard />
            </Guard>
          }
        />
        <Route
          path="/employees"
          element={
            <Guard roles={['admin']}>
              <Emp />
            </Guard>
          }
        />
        <Route
          path="/departments"
          element={
            <Guard roles={['admin']}>
              <Crud
                res="departments"
                title="Departments"
                fields={[{ key: 'name', label: 'Name' }]}
              />
            </Guard>
          }
        />
        <Route
          path="/shifts"
          element={
            <Guard roles={['admin']}>
              <Crud
                res="shifts"
                title="Shifts"
                fields={[
                  { key: 'name', label: 'Shift name' },
                  { key: 'start', label: 'Start', type: 'time' },
                  { key: 'end', label: 'End', type: 'time' },
                  { key: 'breakMins', label: 'Break (min)', type: 'number' },
                ]}
              />
            </Guard>
          }
        />
        <Route
          path="/assign"
          element={
            <Guard roles={AM}>
              <Assignments />
            </Guard>
          }
        />
        <Route
          path="/rotation"
          element={
            <Guard roles={AM}>
              <Rotation />
            </Guard>
          }
        />
        <Route
          path="/calendar"
          element={
            <Guard roles={AM}>
              <Calendar />
            </Guard>
          }
        />
        <Route
          path="/my"
          element={
            <Guard roles={ALL}>
              <MySchedule />
            </Guard>
          }
        />
        <Route
          path="/notifications"
          element={
            <Guard roles={ALL}>
              <Notifications />
            </Guard>
          }
        />
        <Route
          path="/reports"
          element={
            <Guard roles={AM}>
              <Reports />
            </Guard>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
