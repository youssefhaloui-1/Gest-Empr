import { motion } from "framer-motion";
import { BookMarked, CalendarClock, CircleCheck, History, X } from "lucide-react";
import { Book, MemberLoan, Reservation } from "../../types/library";
import { Glass, GHOST } from "../ui/primitives";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));

export function MemberDashboard({
  books,
  loans,
  reservations,
  onCancelReservation,
}: {
  books: Book[];
  loans: MemberLoan[];
  reservations: Reservation[];
  onCancelReservation: (bookId: string) => void;
}) {
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const history = loans.filter((loan) => loan.status === "returned");
  const getBook = (bookId: string) => books.find((book) => book.id === bookId);

  return (
    <section aria-labelledby="dashboard-title" className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-300">Mon espace</p>
          <h3 id="dashboard-title" className="font-display text-2xl sm:text-3xl">Suivi de vos emprunts</h3>
        </div>
        <span className="max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">Profil démonstration · Salma El Idrissi</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Glass className="h-full p-5" glow="rgba(129,140,248,.35)">
          <div className="mb-4 flex items-center gap-2 text-indigo-200"><BookMarked size={17} /><h4 className="font-medium">Emprunts en cours</h4></div>
          {activeLoans.length ? activeLoans.map((loan) => {
            const book = getBook(loan.bookId);
            return book ? <div key={loan.id} className="border-t border-white/10 py-3"><p className="text-sm font-medium">{book.title}</p><p className="mt-1 flex items-center gap-2 text-xs text-amber-200"><CalendarClock size={13} /> À rendre le {formatDate(loan.dueOn)}</p></div> : null;
          }) : <p className="text-sm text-white/45">Aucun emprunt en cours.</p>}
        </Glass>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <Glass className="h-full p-5" glow="rgba(52,211,153,.3)">
          <div className="mb-4 flex items-center gap-2 text-emerald-200"><CircleCheck size={17} /><h4 className="font-medium">Réservations</h4></div>
          {reservations.length ? reservations.map((reservation) => {
            const book = getBook(reservation.bookId);
            return book ? <div key={book.id} className="flex items-center justify-between gap-3 border-t border-white/10 py-3"><div><p className="text-sm font-medium">{book.title}</p><p className="mt-1 text-xs text-white/45">{reservation.status === "ready" ? "Prêt à retirer" : "En attente"} · {formatDate(reservation.createdOn)}</p></div><button onClick={() => onCancelReservation(book.id)} className={`${GHOST} shrink-0 px-3 py-2 text-xs`} aria-label={`Annuler la réservation de ${book.title}`}><X size={13} /> Annuler</button></div> : null;
          }) : <p className="text-sm text-white/45">Aucune réservation active.</p>}
        </Glass>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Glass className="h-full p-5" glow="rgba(244,114,182,.3)">
          <div className="mb-4 flex items-center gap-2 text-fuchsia-200"><History size={17} /><h4 className="font-medium">Historique</h4></div>
          {history.map((loan) => {
            const book = getBook(loan.bookId);
            return book ? <div key={loan.id} className="border-t border-white/10 py-3"><p className="text-sm font-medium">{book.title}</p><p className="mt-1 text-xs text-white/45">Rendu le {formatDate(loan.dueOn)}</p></div> : null;
          })}
        </Glass>
        </motion.div>
      </div>
    </section>
  );
}
