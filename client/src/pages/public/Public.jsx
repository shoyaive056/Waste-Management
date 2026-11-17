import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Camera, MapPin, Truck } from 'lucide-react';
import { Field, useToast } from '../../components/ui';

export function Landing() {
  const feats = [[Camera, 'Report with a photo', 'Describe the problem, add a picture and pin the exact spot on the map.'], [MapPin, 'Pinned on a live map', 'Every report appears on a shared map, coloured by priority.'], [Truck, 'Crews assigned fast', 'Administrators assign a collection team and you follow each step.'], [BarChart3, 'Clear statistics', 'Resolution times and team performance are tracked for the whole city.']];
  return (
    <>
      <section className="bg-brand text-white"><div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div><h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Overflowing bin? Tell the city in a minute.</h1>
          <p className="mt-4 max-w-md text-green-100">Report garbage, illegal dumping or missed collections, and track every report until a team clears it.</p>
          <div className="mt-6 flex gap-3"><Link to="/register" className="btn bg-white text-brand hover:bg-green-50">Create an account</Link><Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10">Log in</Link></div></div>
        <div className="rounded-2xl bg-white/10 p-6"><p className="text-sm font-semibold text-green-100">How a report moves</p>
          <ol className="mt-3 space-y-3">{['Pending', 'Approved', 'Assigned', 'In Progress', 'Resolved'].map((s, i) => <li key={s} className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-brand">{i + 1}</span>{s}</li>)}</ol></div>
      </div></section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {feats.map(([Icon, t, d]) => <div key={t} className="card p-5"><Icon className="h-6 w-6 text-brand" /><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}
      </section>
    </>
  );
}
export const About = () => (
  <div className="mx-auto max-w-3xl space-y-4 px-4 py-14"><h1 className="text-3xl font-extrabold">About the project</h1>
    <p className="text-slate-700">City authorities often struggle to manage waste collection. Citizens meet overflowing bins, illegal dumping and delayed collection, but have no single place to report them.</p>
    <p className="text-slate-700">The Smart Waste Management System gives citizens one place to report problems, administrators one place to review, prioritise and assign them, and collection teams one list of tasks to work through. Priorities are suggested by a transparent rule-based engine and can always be overridden by an administrator.</p>
    <p className="text-sm text-muted">Built for SE331 – Software Engineering Design Capstone Project, Daffodil International University.</p></div>
);
export function Contact() {
  const toast = useToast(); const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-xl px-4 py-14"><h1 className="text-3xl font-extrabold">Contact the municipal office</h1>
      {sent ? <p className="card mt-6 p-5">Thanks. Your message has been recorded and the office will reply by email.</p> :
        <form className="card mt-6 space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); setSent(true); toast('Message sent'); }}>
          <Field label="Your name"><input className="input" required /></Field><Field label="Email"><input type="email" className="input" required /></Field>
          <Field label="Message"><textarea className="input min-h-28" required /></Field><button className="btn-primary">Send message</button></form>}
    </div>
  );
}
