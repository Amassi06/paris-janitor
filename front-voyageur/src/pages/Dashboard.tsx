import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  {BookingStatus,type IBooking } from '../types/booking';

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
        const res = await fetch('http://localhost:3000/api/bookings/me', {
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

    const res = await fetch(`http://localhost:3000/api/payments/${bookingId}/checkout`, {
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
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.statut === BookingStatus.PENDING
                        ? 'bg-orange-100 text-orange-700'
                        : booking.statut === BookingStatus.CONFIRMED || booking.statut === BookingStatus.COMPLETED
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {booking.statut}
                  </span>
                  <span>• {booking.prix_final} €</span>
                  <span>• {new Date(booking.date_prestation).toLocaleDateString()}</span>
                </div>
              </div>

              {booking.statut === BookingStatus.PENDING && (
                <button
                  type="button"
                  onClick={() => handlePay(booking._id)}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  Payer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}