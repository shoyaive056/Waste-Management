import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HOME, useAuth } from '../../contexts/AuthContext';
import { ErrorBox, Field } from '../../components/ui';

const Shell = ({ title, sub, children }) => (
  <div className="mx-auto max-w-md px-4 py-12"><h1 className="text-2xl font-extrabold">{title}</h1><p className="mb-6 text-sm text-muted">{sub}</p><div className="card p-6">{children}</div></div>
);
const DEMO = [['Citizen', 'citizen@swms.demo', 'Citizen@123'], ['Administrator', 'admin@swms.demo', 'Admin@123'], ['Collection team', 'team@swms.demo', 'Team@1234']];

export function Login() {
  const { user, login } = useAuth(); const nav = useNavigate(); const [err, setErr] = useState('');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') })) });
  if (user) return <Navigate to={HOME[user.role]} replace />;
  const submit = async (d) => { try { setErr(''); const u = await login(d.email, d.password); nav(HOME[u.role]); } catch (e) { setErr(e.message); } };
  return (
    <Shell title="Log in" sub="Welcome back. Pick up where you left off.">
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ErrorBox message={err} />
        <Field label="Email" error={errors.email?.message}><input className="input" type="email" autoComplete="email" {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><input className="input" type="password" autoComplete="current-password" {...register('password')} /></Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-muted">New here? <Link className="font-semibold text-brand" to="/register">Create an account</Link></p>
      </form>
      <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-2 text-xs font-semibold text-muted">Demo accounts (click to fill)</p>
        <div className="space-y-1">{DEMO.map(([r, e, p]) => <button key={r} type="button" className="flex w-full justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs hover:bg-brand-50" onClick={() => { setValue('email', e); setValue('password', p); }}><b>{r}</b><span>{e}</span></button>)}</div></div>
    </Shell>
  );
}

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'), email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[+\d][\d\s-]{7,16}$/, 'Enter a valid phone number'), address: z.string().min(5, 'Enter your address'),
  password: z.string().min(8, 'Use at least 8 characters').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[a-z]/, 'Add a lowercase letter').regex(/\d/, 'Add a number').regex(/[^\w\s]/, 'Add a symbol such as @ or !'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export function Register() {
  const { user, register: signup } = useAuth(); const nav = useNavigate(); const [err, setErr] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  if (user) return <Navigate to={HOME[user.role]} replace />;
  const submit = async (d) => { try { setErr(''); await signup(d); nav('/citizen'); } catch (e) { setErr(e.message); } };
  return (
    <Shell title="Create your account" sub="Citizens use this account to report waste and follow progress.">
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ErrorBox message={err} />
        <Field label="Full name" error={errors.name?.message}><input className="input" {...register('name')} /></Field>
        <Field label="Email" error={errors.email?.message}><input className="input" type="email" {...register('email')} /></Field>
        <Field label="Phone number" error={errors.phone?.message}><input className="input" {...register('phone')} placeholder="+224 6xx xx xx xx" /></Field>
        <Field label="Address" error={errors.address?.message}><input className="input" {...register('address')} /></Field>
        <Field label="Password" error={errors.password?.message}><input className="input" type="password" autoComplete="new-password" {...register('password')} /></Field>
        <Field label="Confirm password" error={errors.confirm?.message}><input className="input" type="password" autoComplete="new-password" {...register('confirm')} /></Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-sm text-muted">Already registered? <Link className="font-semibold text-brand" to="/login">Log in</Link></p>
      </form>
    </Shell>
  );
}
