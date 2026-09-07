import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function Success() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">Paiement confirmé</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Votre réservation est enregistrée et votre facture est disponible dans votre espace.
        </p>

        <Link
          to="/dashboard"
          className="mt-7 inline-flex w-full items-center justify-center rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Voir mes réservations
        </Link>
      </div>
    </div>
  );
}
