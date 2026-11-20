import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Recycle,
  Shield,
  Truck,
  Users,
} from 'lucide-react';
import { Field, useToast } from '../../components/ui';

export function Landing() {
  const features = [
    {
      icon: Camera,
      title: 'Geotagged Incident Reporting',
      description: 'Citizens submit real-time reports with photo evidence, GPS coordinates, and severity indicators directly from any mobile device.',
    },
    {
      icon: MapPin,
      title: 'Live Geospatial Operations Map',
      description: 'Municipal supervisors monitor city-wide waste hotspots on a unified OpenStreetMap layer with dynamic priority color coding.',
    },
    {
      icon: Truck,
      title: 'Intelligent Crew Dispatch',
      description: 'Automated and manual task assignment routes field collection crews based on geographic service zones and availability.',
    },
    {
      icon: BarChart3,
      title: 'Operational Reporting & Analytics',
      description: 'Comprehensive operational dashboards track average turnaround time, resolution rates, and monthly collection throughput.',
    },
  ];

  const workflowSteps = [
    { num: '01', title: 'Citizen Report', desc: 'Citizen pins waste location, attaches photo, and selects category.' },
    { num: '02', title: 'Triage & Verification', desc: 'System calculates recommended priority; administrative review approves incident.' },
    { num: '03', title: 'Crew Allocation', desc: 'Dispatched to nearest available zone collection team with task notification.' },
    { num: '04', title: 'Field Resolution', desc: 'Collection crew clears site, updates status in real-time, and logs completion.' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f2e1b] via-[#144227] to-[#165331] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Modern Municipal Waste Intelligence
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
                Cleaner cities through transparent, data-driven waste operations.
              </h1>
              
              <p className="max-w-xl text-base sm:text-lg text-emerald-100/90 leading-relaxed">
                Connect citizens, administrative supervisors, and field collection crews in one unified operations platform. Report, triage, dispatch, and resolve urban waste incidents in real time.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register" className="btn bg-white text-brand-900 font-bold hover:bg-emerald-50 shadow-md">
                  Register as Citizen <ArrowRight className="h-4 w-4 ml-1 inline" />
                </Link>
                <Link to="/login" className="btn bg-emerald-900/60 border border-emerald-500/30 text-white hover:bg-emerald-800/80">
                  Staff & Citizen Portal
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-emerald-800/60 pt-6">
                <div>
                  <p className="text-sm font-bold text-white">Geotagged</p>
                  <p className="text-xs text-emerald-200/80 font-medium">Incident Reporting</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Rule-Based</p>
                  <p className="text-xs text-emerald-200/80 font-medium">Priority Triage</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Real-Time</p>
                  <p className="text-xs text-emerald-200/80 font-medium">Lifecycle Tracking</p>
                </div>
              </div>
            </div>

            {/* Visual Lifecycle Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Incident Lifecycle Flow</span>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                
                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Pending Verification', role: 'Citizen Submission', tone: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
                    { label: 'Approved & Triaged', role: 'Operations Review', tone: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
                    { label: 'Assigned to Zone Crew', role: 'Logistics Dispatch', tone: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' },
                    { label: 'Collection In Progress', role: 'Field Action', tone: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
                    { label: 'Verified & Resolved', role: 'Service Completed', tone: 'bg-green-500/20 text-green-200 border-green-400/30' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">{s.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.tone}`}>{s.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-800">Operational Excellence</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Municipal Resilience and Transparency
          </h2>
          <p className="text-sm text-slate-500">
            A comprehensive toolset for modern environmental management agencies, city authorities, and residents.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all group">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-800 border border-brand-100 group-hover:bg-brand-800 group-hover:text-white transition-colors">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">How Incidents Move to Resolution</h2>
            <p className="text-sm text-slate-500">A clear, automated four-stage pipeline ensuring zero lost requests.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((w) => (
              <div key={w.num} className="space-y-2 relative">
                <span className="text-3xl font-extrabold text-brand-700/30">{w.num}</span>
                <h4 className="font-bold text-sm text-slate-900">{w.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-8">
      <div className="space-y-3">
        <span className="inline-block rounded-md bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
          About The Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Modernizing Municipal Environmental Operations
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Urban waste management is one of the most critical public infrastructure challenges. The Smart Waste Management System (SWMS) provides a modern, cloud-native operational backbone connecting citizens, administrative supervisors, and field collection crews.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Shield className="h-4 w-4 text-brand-700" />
            Accountability & Audit Trails
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every complaint transition—from submission to triage, crew assignment, and final disposal—is timestamped with full audit history and actor attribution.
          </p>
        </div>

        <div className="card p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Users className="h-4 w-4 text-brand-700" />
            Citizen Empowerment
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Residents receive real-time updates and notification alerts on their reports, fostering trust and civic collaboration with local authorities.
          </p>
        </div>
      </div>

      <div className="card p-6 bg-slate-50/50 border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Automated Severity & Priority Engine</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The system evaluates category hazard weights, user-reported severity levels, and environmental proximity indicators to suggest priority ratings (High, Medium, Low), empowering municipal dispatchers to prioritize urgent hazards such as hospital zones, blocked drainage, and market areas.
        </p>
      </div>
    </div>
  );
}

export function Contact() {
  const toast = useToast();
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact the Municipal Office</h1>
        <p className="text-sm text-slate-500">
          Inquiries regarding municipal waste management operations, citizen requests, or platform technical support.
        </p>
      </div>

      {sent ? (
        <div className="card p-8 text-center space-y-3 bg-emerald-50/50 border-emerald-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Message Sent</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Your message has been received and the office will reply to your email address.
          </p>
        </div>
      ) : (
        <form
          className="card p-6 sm:p-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast('Message sent');
          }}
        >
          <Field label="Full Name">
            <input className="input" placeholder="Your name" required />
          </Field>
          <Field label="Email Address">
            <input type="email" className="input" placeholder="you@example.com" required />
          </Field>
          <Field label="Subject">
            <input className="input" placeholder="Inquiry subject" required />
          </Field>
          <Field label="Message">
            <textarea className="input min-h-32" placeholder="Write your message here…" required />
          </Field>
          <button className="btn-primary w-full">Send Message</button>
        </form>
      )}
    </div>
  );
}
