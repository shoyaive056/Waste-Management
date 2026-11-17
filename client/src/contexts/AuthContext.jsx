import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export const HOME = { citizen: '/citizen', admin: '/admin', team: '/team' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.me().then(setUser).finally(() => setLoading(false)); }, []);
  const login = async (email, pw) => { const u = await api.login(email, pw); setUser(u); return u; };
  const register = async (data) => { const u = await api.register(data); setUser(u); return u; };
  const logout = () => { api.logout(); setUser(null); };
  const updateProfile = async (data) => setUser(await api.updateProfile(data));
  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</Ctx.Provider>;
}
