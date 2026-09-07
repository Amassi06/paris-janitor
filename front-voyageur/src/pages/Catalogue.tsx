import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type IService,API_URL } from '../types/booking';


const getCurrentDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};
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
  <div className="min-h-screen bg-white">
  <div className="mx-auto max-w-3xl px-6 py-16">
    <h1 className="text-2xl font-medium text-neutral-900 mb-10">
      Catalogue des services
    </h1>

    <div className="divide-y divide-neutral-200">
      {services.map((service) => (
        <div key={service._id} className="py-8 first:pt-0">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-medium text-neutral-900">
              {service.nom}
            </h2>
            <span className="text-sm text-neutral-500 whitespace-nowrap">
              à partir de {service.prix_base} €
            </span>
          </div>

          <p className="text-neutral-600 text-sm mt-1.5 max-w-xl">
            {service.description}
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-neutral-500 mb-1.5">
                Date d'intervention
              </label>
              <input
                type="datetime-local"
                min={getCurrentDateTimeLocal()}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none transition-colors"
                value={dates[service._id] || ''}
                onChange={(e) => handleDateChange(service._id, e.target.value)}
              />
            </div>

            <button
              onClick={() => handleBook(service._id)}
              disabled={bookingId === service._id}
              className="cursor-pointer text-sm font-medium text-white bg-neutral-900 px-5 py-2 rounded-sm hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bookingId === service._id ? 'Réservation…' : 'Réserver'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
  );
}