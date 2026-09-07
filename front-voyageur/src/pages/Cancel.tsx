import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <X className="h-6 w-6" strokeWidth={2.25} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">Paiement annulé</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          La transaction n'a pas abouti. Aucun montant n'a été débité, votre réservation reste en
          attente de paiement.
        </p>

        <Link
          to="/dashboard"
          className="mt-7 inline-flex w-full items-center justify-center rounded-control bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Retour à mes réservations
        </Link>
      </div>
    </div>
  );
}
