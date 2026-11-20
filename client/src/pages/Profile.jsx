import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Field, useToast } from '../components/ui';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(3, 'Enter your address'),
});

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user,
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'team':
        return 'Field Crew Leader';
      default:
        return 'Registered Citizen';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Account Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your personal details, operational role, and default contact information.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-xl font-bold text-white shadow-md">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  {getRoleLabel(user.role)}
                </span>
                <span className="text-slate-600">{user.email}</span>
              </div>
            </div>
          </div>

          <form
            className="space-y-4 pt-6"
            onSubmit={handleSubmit(async (d) => {
              await updateProfile(d);
              toast('Profile updated successfully');
            })}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={errors.name?.message}>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                  <input className="input pl-9" {...register('name')} />
                </div>
              </Field>

              <Field label="Email Address">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                  <input
                    className="input pl-9 bg-slate-50 text-slate-600 cursor-not-allowed"
                    value={user.email}
                    disabled
                  />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact Phone" error={errors.phone?.message}>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                  <input className="input pl-9" {...register('phone')} />
                </div>
              </Field>

              <Field label="Residential / Office Address" error={errors.address?.message}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                  <input className="input pl-9" {...register('address')} />
                </div>
              </Field>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button className="btn-primary" disabled={isSubmitting}>
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
