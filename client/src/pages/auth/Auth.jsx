import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HOME, useAuth } from '../../contexts/AuthContext';
import { ErrorBox, Field } from '../../components/ui';
import { Recycle, ShieldCheck, ArrowRight, UserCheck, Shield, Truck } from 'lucide-react';

const Shell = ({ title, sub, children }) => (
  <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
    <div className="text-center mb-8 space-y-2">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 text-white shadow-md border border-brand-700">
        <Recycle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">{sub}</p>
    </div>
    <div className="card p-6 sm:p-8 shadow-card">{children}</div>
  </div>
);

const DEMO = [
  { role: 'Citizen', email: 'citizen@swms.demo', pw: 'Citizen@123', icon: UserCheck, desc: 'Public Reporting' },
  { role: 'Admin', email: 'admin@swms.demo', pw: 'Admin@123', icon: Shield, desc: 'City Operations' },
  { role: 'Crew Leader', email: 'team@swms.demo', pw: 'Team@1234', icon: Truck, desc: 'Field Tasks' },
];

export function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email('Enter a valid official email address'),
        password: z.string().min(1, 'Password is required'),
      })
    ),
  });

  if (user) return <Navigate to={HOME[user.role]} replace />;

  const submit = async (d) => {
    try {
      setErr('');
      const u = await login(d.email, d.password);
      nav(HOME[u.role]);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Shell title="Sign in to SWMS" sub="Access your municipal waste management dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ErrorBox message={err} />
        <Field label="Email Address" error={errors.email?.message}>
          <input className="input" type="email" autoComplete="email" placeholder="name@domain.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input className="input" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <button className="btn-primary w-full py-2.5 text-sm" disabled={isSubmitting}>
          {isSubmitting ? 'Authenticating…' : 'Sign in to Platform'}
        </button>
        <p className="text-center text-xs text-slate-500">
          New citizen user?{' '}
          <Link className="font-bold text-brand-800 hover:underline" to="/register">
            Register citizen account
          </Link>
        </p>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Test Access (1-Click Fill)
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Pre-configured
          </span>
        </div>
        <div className="grid gap-1.5">
          {DEMO.map((item) => (
            <button
              key={item.role}
              type="button"
              className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-left text-xs transition-all hover:bg-brand-50 hover:border-brand-200 group"
              onClick={() => {
                setValue('email', item.email);
                setValue('password', item.pw);
              }}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-slate-500 group-hover:text-brand-700" />
                <div>
                  <p className="font-bold text-slate-800 leading-tight">{item.role}</p>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 group-hover:text-brand-800 font-medium">
                {item.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^[+\d][\d\s-]{7,16}$/, 'Enter a valid phone number (e.g. +224 6xx xx xx xx)'),
    address: z.string().min(5, 'Enter your residential or street address'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/\d/, 'Include a number')
      .regex(/[^\w\s]/, 'Include a special symbol (@, #, !, etc.)'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

export function Register() {
  const { user, register: signup } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  if (user) return <Navigate to={HOME[user.role]} replace />;

  const submit = async (d) => {
    try {
      setErr('');
      await signup(d);
      nav('/citizen');
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Shell title="Create Citizen Account" sub="Register to report urban waste and follow resolution progress in real time.">
      <form className="space-y-3.5" onSubmit={handleSubmit(submit)} noValidate>
        <ErrorBox message={err} />
        <Field label="Full Name" error={errors.name?.message}>
          <input className="input" placeholder="e.g. Mamadou Diallo" {...register('name')} />
        </Field>
        <Field label="Email Address" error={errors.email?.message}>
          <input className="input" type="email" placeholder="name@domain.com" {...register('email')} />
        </Field>
        <Field label="Phone Contact" error={errors.phone?.message}>
          <input className="input" placeholder="+224 6xx xx xx xx" {...register('phone')} />
        </Field>
        <Field label="Street / Residential Address" error={errors.address?.message}>
          <input className="input" placeholder="Neighbourhood, street name or landmark" {...register('address')} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message}>
            <input className="input" type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
          </Field>
          <Field label="Confirm Password" error={errors.confirm?.message}>
            <input className="input" type="password" autoComplete="new-password" placeholder="••••••••" {...register('confirm')} />
          </Field>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Password must contain at least 8 characters, with uppercase, lowercase, numbers, and special symbols.
        </p>
        <button className="btn-primary w-full py-2.5 text-sm" disabled={isSubmitting}>
          {isSubmitting ? 'Registering Account…' : 'Complete Registration'}
        </button>
        <p className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <Link className="font-bold text-brand-800 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </Shell>
  );
}
