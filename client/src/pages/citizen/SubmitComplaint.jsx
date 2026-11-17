import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { suggestPriority } from '../../utils/priority';
import MapView from '../../components/MapView';
import { Card, ErrorBox, Field, PriorityBadge, useToast } from '../../components/ui';

const schema = z.object({
  title: z.string().min(5, 'Use at least 5 characters').max(100),
  description: z.string().min(20, 'Describe the problem in at least 20 characters'),
  categoryId: z.string().min(1, 'Choose a category'), severity: z.enum(['low', 'medium', 'high']),
  address: z.string().min(5, 'Enter the address or nearest landmark'), contact: z.string().min(7, 'Enter a phone number we can reach'),
});

// Resize to keep localStorage small in mock mode; the backend will accept the original upload via Multer.
const toDataUrl = (file) => new Promise((res) => {
  const img = new Image(); img.onload = () => {
    const s = Math.min(1, 800 / img.width); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7));
  }; img.src = URL.createObjectURL(file);
});

export default function SubmitComplaint() {
  const { user } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const [cats, setCats] = useState([]); const [pos, setPos] = useState(null); const [photo, setPhoto] = useState(null); const [err, setErr] = useState(''); const [geoMsg, setGeoMsg] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { severity: 'low', contact: user.phone, address: '' } });
  useEffect(() => { api.categories().then((c) => setCats(c.filter((x) => x.active))); }, []);
  const w = watch(); const cat = cats.find((c) => c.id === w.categoryId);
  const suggestion = useMemo(() => cat ? suggestPriority({ categorySlug: cat.slug, severity: w.severity, text: `${w.title} ${w.description}` }) : null, [cat, w.severity, w.title, w.description]);

  const locate = () => {
    if (!navigator.geolocation) return setGeoMsg('Your browser does not support location. Click the map to choose the spot.');
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }); setGeoMsg(''); },
      () => setGeoMsg('Location permission was denied. Click the map to choose the spot instead.'));
  };
  const onFile = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setErr('Photo must be a JPG, PNG or WebP image.');
    if (f.size > 5 * 1024 * 1024) return setErr('Photo must be smaller than 5 MB.');
    setErr(''); setPhoto(await toDataUrl(f));
  };
  const submit = async (d) => {
    if (!pos) return setErr('Choose the waste location: use "Detect my location" or click the map.');
    try { setErr(''); const c = await api.createComplaint({ ...d, ...pos, photo }); toast(`Complaint ${c.id} submitted`); nav(`/citizen/complaints/${c.id}`); } catch (e) { setErr(e.message); }
  };
  return (
    <>
      <h1 className="text-2xl font-extrabold">Report a waste problem</h1>
      <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
        <Card title="What is the problem?"><div className="space-y-4">
          <Field label="Title" error={errors.title?.message}><input className="input" {...register('title')} placeholder="e.g. Bin overflowing near the market" /></Field>
          <Field label="Description" error={errors.description?.message}><textarea className="input min-h-28" {...register('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Waste category" error={errors.categoryId?.message}><select className="input" {...register('categoryId')}><option value="">Choose…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="How severe is it?"><select className="input" {...register('severity')}><option value="low">Minor</option><option value="medium">Moderate</option><option value="high">Severe</option></select></Field></div>
          {suggestion && <div className="rounded-lg bg-slate-50 p-3 text-sm"><div className="flex items-center gap-2">Suggested priority <PriorityBadge priority={suggestion.priority} /></div>
            <p className="mt-1 text-xs text-muted">{suggestion.reasons.join(' · ') || 'Based on category'}. An administrator reviews this.</p></div>}
          <Field label="Photo (optional, JPG/PNG/WebP, max 5 MB)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="input" />{photo && <img src={photo} alt="Waste site preview" className="mt-2 max-h-40 rounded-lg" />}</Field>
        </div></Card>
        <Card title="Where is it?"><div className="space-y-4">
          <Field label="Address or landmark" error={errors.address?.message}><input className="input" {...register('address')} placeholder="Street, neighbourhood, landmark" /></Field>
          <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn-outline" onClick={locate}><Crosshair className="h-4 w-4" />Detect my location</button>
            <span className="text-sm text-muted">{pos ? `Selected: ${pos.lat}, ${pos.lng}` : 'or click the map to drop a pin'}</span></div>
          {geoMsg && <p className="text-sm text-amber-700">{geoMsg}</p>}
          <MapView picked={pos} onPick={setPos} height={300} />
          <Field label="Contact phone" error={errors.contact?.message}><input className="input" {...register('contact')} /></Field>
        </div></Card>
        <div className="space-y-3 lg:col-span-2"><ErrorBox message={err} />
          <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit report'}</button></div>
      </form>
    </>
  );
}
