import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Card, Field, useToast } from '../components/ui';

const schema = z.object({ name: z.string().min(2, 'Enter your name'), phone: z.string().min(7, 'Enter a valid phone number'), address: z.string().min(3, 'Enter your address') });
export default function Profile() {
  const { user, updateProfile } = useAuth(); const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: user });
  return (
    <><h1 className="text-2xl font-extrabold">Profile</h1>
      <Card title="Your details" className="max-w-xl"><form className="space-y-4" onSubmit={handleSubmit(async (d) => { await updateProfile(d); toast('Profile saved'); })} noValidate>
        <Field label="Email"><input className="input bg-slate-50" value={user.email} disabled /></Field>
        <Field label="Full name" error={errors.name?.message}><input className="input" {...register('name')} /></Field>
        <Field label="Phone" error={errors.phone?.message}><input className="input" {...register('phone')} /></Field>
        <Field label="Address" error={errors.address?.message}><input className="input" {...register('address')} /></Field>
        <button className="btn-primary" disabled={isSubmitting}>Save changes</button></form></Card></>
  );
}
