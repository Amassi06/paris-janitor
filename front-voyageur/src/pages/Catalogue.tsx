import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IService } from '../types/booking';

// À adapter selon ton bundler (Vite: import.meta.env.VITE_API_URL, CRA: process.env.REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Catalogue() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<{ [key: string]: string }>({});
  const [bookingId, setBookingId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error('Erreur de chargement du catalogue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [navigate]);

  const handleDateChange = (serviceId: string, value: string) => {
    setDates(prev => ({ ...prev, [serviceId]: value }));
  };

  const handleBook = async (serviceId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const selectedDate = dates[serviceId];
    if (!selectedDate) {
      alert("Veuillez sélectionner une date et une heure pour cette prestation.");
      return;
    }

    setBookingId(serviceId);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_service: serviceId,
          date_prestation: new Date(selectedDate).toISOString(),
        })
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.message || 'Réservation échouée'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setBookingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement des prestations...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Catalogue des Services</h1>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">
            Voir mes réservations
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{service.nom}</h2>
                <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'intervention</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={dates[service._id] || ''}
                    onChange={(e) => handleDateChange(service._id, e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold text-gray-900">À partir de {service.prix_base} €</span>
                <button
                  onClick={() => handleBook(service._id)}
                  disabled={bookingId === service._id}
                  className="bg-gray-900 text-white px-4 py-2 rounded font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingId === service._id ? 'Réservation...' : 'Réserver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}