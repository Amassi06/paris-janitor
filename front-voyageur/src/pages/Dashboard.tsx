import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  {BookingStatus,type IBooking,API_URL } from '../types/booking';

const STATUT_STYLE: Record<BookingStatus, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUT_LABEL: Record<BookingStatus, string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Payée',
  COMPLETED: 'Réalisée',
  CANCELLED: 'Annulée',
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/bookings/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Erreur lors de la récupération des réservations');
        }

        const data: IBooking[] = await res.json();
        setBookings(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erreur réseau ou inattendue');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handlePay = async (bookingId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const res = await fetch(`${API_URL}/api/payments/${bookingId}/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Erreur lors de la génération du lien de paiement');
    }

    if (data.url) {
      window.location.assign(data.url);
    }
  } catch (err) {
    console.error('Erreur handlePay :', err);
    alert(err instanceof Error ? err.message : 'Impossible de contacter le serveur de paiement.');
  }
};
const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Annuler cette réservation ?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: BookingStatus.CANCELLED })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'annulation");

    
      setBookings(prev =>
        prev.map(b => (b._id === bookingId ? { ...b, statut: data.statut } : b))
      );
    } catch (err) {
      console.error('Erreur handleCancel :', err);
      alert(err instanceof Error ? err.message : 'Erreur réseau.');
    }
  };
  const handleReview = async (bookingId: string) => {
    const noteStr = window.prompt("Notez la prestation (de 1 à 5) :");
    if (!noteStr) return; 

    const note = parseInt(noteStr, 10);
    if (isNaN(note) || note < 1 || note > 5) {
      alert("La note doit être un chiffre entre 1 et 5.");
      return;
    }

    const commentaire = window.prompt("Laissez un commentaire (optionnel) :") || "";

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note, commentaire })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de l'envoi de l'avis.");
      }
      alert("Merci pour votre avis !");  
      window.location.reload();
    } catch (err) {
      console.error('Erreur handleReview :', err);
      alert(err instanceof Error ? err.message : 'Erreur réseau.');
    }
  };
  const handleViewInvoice = async (bookingId: string) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/invoices/${bookingId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement de la facture');
    }

    const blob = await response.blob();
    const fileUrl = window.URL.createObjectURL(blob);
    window.open(fileUrl, '_blank');

    setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
  } catch (error) {
    console.error(error);
    alert('Impossible d’ouvrir la facture.');
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Mes Réservations</h1>

        {loading && <p className="text-gray-600">Chargement de vos réservations...</p>}

        {error && (
          <div className="mb-6 rounded bg-red-50 p-4 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-gray-600">Vous n'avez aucune réservation pour le moment.</p>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center justify-between rounded-lg bg-white p-5 shadow-sm border border-gray-200"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  Réservation #{booking._id.slice(-6)}
                </p>
                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${STATUT_STYLE[booking.statut]}`}
                  >
                    {STATUT_LABEL[booking.statut]}
                  </span>
                  <span>• {booking.prix_final} €</span>
                  <span>• {new Date(booking.date_prestation).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                {booking.statut === BookingStatus.PENDING && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePay(booking._id)}
                      className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Payer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(booking._id)}
                      className="cursor-pointer rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                    >
                      Annuler
                    </button>
                  </>
                )}
                {(booking.statut === BookingStatus.CONFIRMED ||
                  booking.statut === BookingStatus.COMPLETED) && (
                  <button
                    type="button"
                    onClick={() => handleViewInvoice(booking._id)}
                    className="cursor-pointer rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition text-center flex items-center"
                  >
                    Voir la facture
                  </button>
                )}

                {booking.statut === BookingStatus.COMPLETED && !booking.note && (
                  <button
                    onClick={() => handleReview(booking._id)}
                    className="cursor-pointer rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
                  >
                    Évaluer
                  </button>
                )}
                {booking.note && (
                  <span className="flex items-center text-sm font-bold text-yellow-500">
                    ★ {booking.note}/5
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}