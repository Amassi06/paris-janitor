import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  {BookingStatus,type IBooking,API_URL } from '../types/booking';
import { CalendarDays, CircleAlert, FileText, Star } from 'lucide-react';

const STATUT_STYLE: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  COMPLETED: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
};

const STATUT_DOT: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-emerald-500',
  COMPLETED: 'bg-brand-500',
  CANCELLED: 'bg-red-500',
};

const STATUT_LABEL: Record<BookingStatus, string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Payée',
  COMPLETED: 'Réalisée',
  CANCELLED: 'Annulée',
};

const BTN = 'inline-flex items-center justify-center gap-1.5 rounded-control px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50';
const BTN_PRIMARY = `${BTN} bg-brand-600 text-white shadow-sm hover:bg-brand-700`;
const BTN_DARK = `${BTN} bg-slate-900 text-white shadow-sm hover:bg-slate-800`;
const BTN_OUTLINE = `${BTN} bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50`;
const BTN_DANGER = `${BTN} bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mes réservations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Réglez vos prestations, téléchargez vos factures et évaluez-les une fois réalisées.
            </p>
          </div>
          {!loading && !error && bookings.length > 0 && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
              {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
            </span>
          )}
        </header>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-card border border-slate-200 bg-white p-5 shadow-card">
                <div className="h-4 w-44 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-64 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-900">Aucune réservation</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Parcourez le catalogue pour réserver votre première prestation.
            </p>
            <button type="button" onClick={() => navigate('/catalogue')} className={`${BTN_PRIMARY} mt-6`}>
              Voir le catalogue
            </button>
          </div>
        )}

        <div className="space-y-3">
          {bookings.map((booking) => (
            <article
              key={booking._id}
              className="rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-raised"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${STATUT_DOT[booking.statut]}`} />
                    <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                      Réservation #{booking._id.slice(-6).toUpperCase()}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUT_STYLE[booking.statut]}`}
                    >
                      {STATUT_LABEL[booking.statut]}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                      {formatDate(booking.date_prestation)}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900">{booking.prix_final} €</span>
                    {booking.note && (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                        <Star className="h-4 w-4 fill-current" strokeWidth={0} />
                        {booking.note}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {booking.statut === BookingStatus.PENDING && (
                    <>
                      <button type="button" onClick={() => handlePay(booking._id)} className={BTN_PRIMARY}>
                        Payer
                      </button>
                      <button type="button" onClick={() => handleCancel(booking._id)} className={BTN_DANGER}>
                        Annuler
                      </button>
                    </>
                  )}

                  {(booking.statut === BookingStatus.CONFIRMED ||
                    booking.statut === BookingStatus.COMPLETED) && (
                    <button type="button" onClick={() => handleViewInvoice(booking._id)} className={BTN_OUTLINE}>
                      <FileText className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                      Facture
                    </button>
                  )}

                  {booking.statut === BookingStatus.COMPLETED && !booking.note && (
                    <button type="button" onClick={() => handleReview(booking._id)} className={BTN_DARK}>
                      Évaluer
                    </button>
                  )}
                </div>
              </div>

              {booking.commentaire && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500">Votre avis</p>
                  {/* wrap-anywhere plutôt que break-words : un avis d'un seul
                      mot de 1000 caractères doit pouvoir être coupé n'importe où. */}
                  <p className="mt-1 wrap-anywhere text-sm leading-relaxed text-slate-600">
                    {booking.commentaire}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
