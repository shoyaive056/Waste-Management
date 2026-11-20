import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Camera, Crosshair, MapPin, Sparkles, UploadCloud, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { suggestPriority } from '../../utils/priority';
import MapView from '../../components/MapView';
import { Card, ErrorBox, Field, PriorityBadge, useToast } from '../../components/ui';

const schema = z.object({
  title: z.string().min(5, 'Use at least 5 characters').max(100),
  description: z.string().min(20, 'Describe the problem in at least 20 characters'),
  categoryId: z.string().min(1, 'Choose a category'),
  severity: z.enum(['low', 'medium', 'high']),
  address: z.string().min(5, 'Enter the address or nearest landmark'),
  contact: z.string().min(7, 'Enter a phone number we can reach'),
});

// Resize to keep localStorage small in mock mode; the backend will accept the original upload via Multer.
const toDataUrl = (file) =>
  new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 800 / img.width);
      const c = document.createElement('canvas');
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.7));
    };
    img.src = URL.createObjectURL(file);
  });

export default function SubmitComplaint() {
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [cats, setCats] = useState([]);
  const [pos, setPos] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState('');
  const [geoMsg, setGeoMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'low', contact: user.phone || '', address: '' },
  });

  useEffect(() => {
    api.categories().then((c) => setCats(c.filter((x) => x.active)));
  }, []);

  const w = watch();
  const cat = cats.find((c) => c.id === w.categoryId);
  const suggestion = useMemo(
    () =>
      cat
        ? suggestPriority({
            categorySlug: cat.slug,
            severity: w.severity,
            text: `${w.title || ''} ${w.description || ''}`,
          })
        : null,
    [cat, w.severity, w.title, w.description]
  );

  const locate = () => {
    if (!navigator.geolocation) {
      return setGeoMsg('Your browser does not support geolocation. Please click on the map to set the location.');
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) });
        setGeoMsg('');
      },
      () => {
        setGeoMsg('Location permission was denied. Please click on the map to select the spot.');
      }
    );
  };

  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return setErr('Photo must be a JPG, PNG or WebP image.');
    }
    if (f.size > 5 * 1024 * 1024) {
      return setErr('Photo must be smaller than 5 MB.');
    }
    setErr('');
    setPhoto(await toDataUrl(f));
  };

  const submit = async (d) => {
    if (!pos) {
      return setErr('Please specify the waste location: click "Detect my location" or pin it on the map.');
    }
    try {
      setErr('');
      const c = await api.createComplaint({ ...d, ...pos, photo });
      toast(`Incident report ${c.id} created successfully`);
      nav(`/citizen/complaints/${c.id}`);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Report a Waste Incident
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Submit details and coordinates of municipal waste, overflowing bins, or dumping hazards for dispatch review.
        </p>
      </div>

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
        {/* Left Column: Problem Details */}
        <Card title="Incident Details">
          <div className="space-y-4">
            <Field label="Incident Title" error={errors.title?.message}>
              <input
                className="input"
                {...register('title')}
                placeholder="e.g., Overflowing dumpster near community market"
              />
            </Field>

            <Field label="Detailed Description" error={errors.description?.message}>
              <textarea
                className="input min-h-28 leading-relaxed"
                {...register('description')}
                placeholder="Describe the type of waste, environmental hazards, obstruction of traffic, or odors..."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Waste Category" error={errors.categoryId?.message}>
                <select className="input" {...register('categoryId')}>
                  <option value="">Select category...</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Reported Severity">
                <select className="input" {...register('severity')}>
                  <option value="low">Minor (Regular cleanup)</option>
                  <option value="medium">Moderate (Significant buildup)</option>
                  <option value="high">Severe (Hazardous / Overflowing)</option>
                </select>
              </Field>
            </div>

            {/* Smart Priority Suggestion Box */}
            {suggestion && (
              <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 p-3.5 text-sm transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Algorithmic Priority Evaluation:</span>
                  </div>
                  <PriorityBadge priority={suggestion.priority} />
                </div>
                <p className="mt-1.5 text-xs text-emerald-800/80">
                  {suggestion.reasons.join(' · ') || 'Evaluated based on selected category & severity parameters'}. Operations dispatch will review before final dispatch.
                </p>
              </div>
            )}

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="label">Incident Photo (Optional)</label>
              {!photo ? (
                <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition group">
                  <div className="rounded-full bg-white p-3 text-slate-500 shadow-xs group-hover:text-emerald-600 transition">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-700">
                    Click or drag photo to upload
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    JPG, PNG, WebP up to 5 MB
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFile}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={photo}
                    alt="Incident location preview"
                    className="max-h-56 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white shadow-sm hover:bg-slate-900 transition"
                    title="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right Column: Location & Contact */}
        <Card title="Incident Location & Coordinates">
          <div className="space-y-4">
            <Field label="Address / Nearest Landmark" error={errors.address?.message}>
              <input
                className="input"
                {...register('address')}
                placeholder="e.g., Road 14, Sector 7, opposite Central Park gate"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                className="btn-outline text-xs"
                onClick={locate}
              >
                <Crosshair className="h-4 w-4 text-emerald-600" />
                <span>Detect My Location</span>
              </button>

              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {pos ? (
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {pos.lat}, {pos.lng}
                  </span>
                ) : (
                  <span>Click anywhere on map to drop pin</span>
                )}
              </div>
            </div>

            {geoMsg && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-800 border border-amber-200">
                {geoMsg}
              </p>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <MapView picked={pos} onPick={setPos} height={300} />
            </div>

            <Field label="Callback Phone Number" error={errors.contact?.message}>
              <input
                className="input"
                {...register('contact')}
                placeholder="e.g., +880 1711 000000"
              />
            </Field>
          </div>
        </Card>

        {/* Submission Bottom Bar */}
        <div className="lg:col-span-2 space-y-4 pt-2">
          <ErrorBox message={err} />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav('/citizen')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary min-w-40 py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting Report...
                </span>
              ) : (
                'Submit Incident Report'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
