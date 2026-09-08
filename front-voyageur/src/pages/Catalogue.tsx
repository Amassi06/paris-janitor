import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type IService, type IProfile, API_URL } from '../types/booking';
import { Sparkles } from 'lucide-react';


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
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [offreDisponible, setOffreDisponible] = useState(false);

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
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setOffreDisponible(data.offre_disponible);
      }
    };

    fetchServices();
    fetchProfile().catch(() => setProfile(null));
  }, [navigate]);

  const prixAffiche = (service: IService) => {
    const plafond =
      profile?.subscription === 'EXPLORATOR' ? Infinity : profile?.subscription === 'BAG_PACKER' ? 80 : 0;

    if (offreDisponible && service.prix_base <= plafond) {
      return { prix: 0, prixBarre: service.prix_base, offerte: true };
    }

    if (profile?.subscription === 'EXPLORATOR') {
      return {
        prix: Math.round(service.prix_base * 0.95 * 100) / 100,
        prixBarre: service.prix_base,
        offerte: false,
      };
    }

    return { prix: service.prix_base, prixBarre: null, offerte: false };
  };

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

  const BTN = 'inline-flex items-center justify-center gap-1.5 rounded-control px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Catalogue des services</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choisissez une prestation, indiquez la date d'intervention souhaitée et confirmez.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-card border border-slate-200 bg-white p-6 shadow-card">
                <div className="h-4 w-40 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
                <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-100" />
                <div className="mt-6 h-9 w-full rounded-control bg-slate-100" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-sm font-semibold text-slate-900">Aucune prestation disponible</h2>
            <p className="mt-1 text-sm text-slate-500">Le catalogue sera enrichi prochainement.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <article
                key={service._id}
                className="flex flex-col rounded-card border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-raised"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">
                    {service.nom}
                    {service.vip_only && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 align-middle text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Sparkles className="h-3 w-3" strokeWidth={2} />
                        VIP
                      </span>
                    )}
                  </h2>

                  {(() => {
                    const { prix, prixBarre, offerte } = prixAffiche(service);
                    return (
                      <span className="flex shrink-0 items-center gap-1.5">
                        {prixBarre !== null && (
                          <span className="text-xs tabular-nums text-slate-400 line-through">{prixBarre} €</span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                            offerte
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {offerte ? 'Offerte' : `${prix} €`}
                        </span>
                      </span>
                    );
                  })()}
                </div>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{service.description}</p>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <label
                    htmlFor={`date-${service._id}`}
                    className="block text-xs font-medium text-slate-500"
                  >
                    Date d'intervention
                  </label>
                  <input
                    id={`date-${service._id}`}
                    type="datetime-local"
                    min={getCurrentDateTimeLocal()}
                    className="mt-1.5 w-full rounded-control border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none"
                    value={dates[service._id] || ''}
                    onChange={(e) => handleDateChange(service._id, e.target.value)}
                  />

                  <button
                    onClick={() => handleBook(service._id)}
                    disabled={bookingId === service._id}
                    className={`${BTN} mt-3 w-full bg-brand-600 text-white shadow-sm hover:bg-brand-700`}
                  >
                    {bookingId === service._id ? 'Réservation…' : 'Réserver'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
