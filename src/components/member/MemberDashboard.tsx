import { motion } from "framer-motion";
import { BookMarked, CalendarClock, History, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Book, MemberLoan } from "../../types/library";
import { Glass } from "../ui/primitives";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T12:00:00`)
  );

export function MemberDashboard({
  books,
  loans,
}: {
  books: Book[];
  loans: MemberLoan[];
}) {
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const history = loans.filter((loan) => loan.status === "returned");
  const getBook = (bookId: string) => books.find((book) => book.id === bookId);

  return (
    <section aria-labelledby="dashboard-title" className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Espace Adhérent</p>
          <h3 id="dashboard-title" className="font-display text-2xl sm:text-3xl">
            Suivi personnel & Guide du lecteur
          </h3>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-300">
          Adhérent actif · Prêts enregistrés au guichet
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active Loans */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Glass className="h-full p-5" glow="rgba(52,211,153,.3)">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300">
                <BookMarked size={18} />
                <h4 className="font-medium text-sm sm:text-base">Emprunts en cours</h4>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-mono text-emerald-300">
                {activeLoans.length} livre{activeLoans.length > 1 ? "s" : ""}
              </span>
            </div>

            {activeLoans.length ? (
              <div className="space-y-3">
                {activeLoans.map((loan) => {
                  const book = getBook(loan.bookId);
                  return book ? (
                    <div key={loan.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                      <p className="text-sm font-medium text-white/90 line-clamp-1">{book.title}</p>
                      <p className="text-xs text-white/50">{book.author}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <CalendarClock size={13} /> À rendre le {formatDate(loan.dueOn)}
                        </span>
                        <span className="text-[11px] text-white/40 font-mono">Rayon {book.shelf}</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-xs text-white/45 py-4 text-center">
                Aucun livre actuellement emprunté sur votre carte.
              </p>
            )}
          </Glass>
        </motion.div>

        {/* Library Desk Policy */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Glass className="h-full p-5" glow="rgba(129,140,248,.3)">
            <div className="mb-4 flex items-center gap-2 text-indigo-300">
              <ShieldCheck size={18} />
              <h4 className="font-medium text-sm sm:text-base">Règles & Guichet sur place</h4>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-white/70">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <p className="font-semibold text-white/90 flex items-center gap-1.5 mb-1">
                  <MapPin size={13} className="text-indigo-400" /> Emprunt physique uniquement
                </p>
                <p className="text-white/60">
                  Prenez le livre en rayon à l'aide de sa cote (ex: INF-004) et présentez-vous au guichet du bibliothécaire pour enregistrer le prêt avec votre carte.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <p className="font-semibold text-white/90 flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-indigo-400" /> Conditions de prêt
                </p>
                <p className="text-white/60">
                  Durée de prêt de <strong>21 jours</strong> renouvelable 1 fois sur place. Jusqu'à 4 ouvrages simultanés autorisés par adhérent.
                </p>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* Returned Books History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <Glass className="h-full p-5" glow="rgba(244,114,182,.3)">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-fuchsia-300">
                <History size={18} />
                <h4 className="font-medium text-sm sm:text-base">Historique des retours</h4>
              </div>
              <span className="text-xs text-white/40">{history.length} retour{history.length > 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2.5">
              {history.map((loan) => {
                const book = getBook(loan.bookId);
                return book ? (
                  <div key={loan.id} className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-xs">
                    <p className="font-medium text-white/80 truncate">{book.title}</p>
                    <p className="mt-1 text-[11px] text-white/45">Rendu le {formatDate(loan.dueOn)}</p>
                  </div>
                ) : null;
              })}
            </div>
          </Glass>
        </motion.div>
      </div>
    </section>
  );
}
