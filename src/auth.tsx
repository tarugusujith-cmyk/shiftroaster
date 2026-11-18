// Login state (stored in localStorage) and the role-based route guard.
import { createContext, useContext, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
export type U = {
  id: number;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId: number;
};
const C = createContext<any>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setU] = useState<U | null>(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const login = (u: U) => {
    localStorage.setItem('user', JSON.stringify(u));
    setU(u);
  };
  const logout = () => {
    localStorage.removeItem('user');
    setU(null);
  };
  return <C.Provider value={{ user, login, logout }}>{children}</C.Provider>;
};
export const useAuth = (): { user: U | null; login: (u: U) => void; logout: () => void } =>
  useContext(C);
export const Guard = ({ roles, children }: { roles: string[]; children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? (
    children
  ) : (
    <Navigate to={user.role === 'employee' ? '/my' : '/'} replace />
  );
};
