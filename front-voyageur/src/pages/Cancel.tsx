import { Link } from 'react-router-dom';

export default function Cancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4 font-bold">
        ✕
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement Annulé</h1>
      <p className="text-gray-600 mb-6">La transaction n'a pas abouti. Aucun montant n'a été débité.</p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
      >
        Réessayer
      </Link>
    </div>
  );
}