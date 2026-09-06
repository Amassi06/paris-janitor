import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 font-bold">
        ✓
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
      <p className="text-gray-600 mb-6">Ta réservation a bien été enregistrée et ta facture est disponible.</p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}