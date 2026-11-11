import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Radar,
  Search,
  User,
  Send,
  Check,
  Bell,
  PackageCheck,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import { Book, Loan, Cond, radar, RADAR, ReturnRecord, dueText } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge, Magnetic } from "../ui/primitives";
import { ScanHub } from "./ScanHub";
import { Inspector } from "./Inspector";
import { ReturnStation } from "./ReturnStation";
import { DashboardCharts } from "./DashboardCharts";
import { AddBookModal } from "./AddBookModal";

export function ManagerView({
  books,
  setBooks,
  loans,
  setLoans,
  returnHistory,
  setReturnHistory,
}: {
  books: Book[];
  setBooks: (f: (b: Book[]) => Book[]) => void;
  loans: Loan[];
  setLoans: (f: (items: Loan[]) => Loan[]) => void;
  returnHistory: ReturnRecord[];
  setReturnHistory: (f: (items: ReturnRecord[]) => ReturnRecord[]) => void;
}) {
  const [inspect, setInspect] = useState<Loan | null>(null);
  const [ret, setRet] = useState<Loan | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "late" | "soon">("all");

  // New Book Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scannedIsbnForModal, setScannedIsbnForModal] = useState("");

  const counts = (["yellow", "orange", "red"] as const).map((k) => ({
    k,
    n: loans.filter((l) => radar(l.dueIn) === k).length,
  }));

  const notify = (l: Loan) => {
    setSending(l.id);
    setTimeout(() => {
      setSending(null);
      setLoans((ls) => ls.map((x) => (x.id === l.id ? { ...x, notified: true } : x)));
    }, 1200);
  };

  const doReturn = (c: Cond) => {
    const l = ret!;
    setLoans((ls) => ls.filter((x) => x.id !== l.id));
    setBooks((bs) =>
      bs.map((b) =>
        b.id === l.bookId && c !== "Endommagé"
          ? { ...b, stock: Math.min(b.total, b.stock + 1) }
          : b
      )
    );
    setReturnHistory((items) => [
      {
        id: `RET-${Date.now()}`,
        loanId: l.id,
        bookId: l.bookId,
        condition: c,
        returnedOn: new Date().toISOString().slice(0, 10),
      },
      ...items,
    ]);
  };

  // Quick Loan at Desk
  const handleQuickLoan = (bookId: string, memberId: string) => {
    const newLoan: Loan = {
      id: `EMP-${Math.floor(600 + Math.random() * 400)}`,
      bookId,
      memberId,
      dueIn: 21,
      notified: false,
    };
    setLoans((prev) => [newLoan, ...prev]);
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, stock: Math.max(0, b.stock - 1) } : b))
    );
  };

  // Quick Return at Desk
  const handleQuickReturn = (loanId: string) => {
    const loanToReturn = loans.find((l) => l.id === loanId);
    if (!loanToReturn) return;
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    setBooks((prev) =>
      prev.map((b) =>
        b.id === loanToReturn.bookId ? { ...b, stock: Math.min(b.total, b.stock + 1) } : b
      )
    );
    setReturnHistory((items) => [
      {
        id: `RET-${Date.now()}`,
        loanId,
        bookId: loanToReturn.bookId,
        condition: "Usure normale",
        returnedOn: new Date().toISOString().slice(0, 10),
      },
      ...items,
    ]);
  };

  // Restock copies from Scanner
  const handleAddCopies = (bookId: string, quantity: number) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, stock: b.stock + quantity, total: b.total + quantity }
          : b
      )
    );
  };

  // Add new book to catalog
  const handleAddNewBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const sorted = useMemo(
    () =>
      [...loans]
        .filter((loan) => {
          const book = books.find((item) => item.id === loan.bookId);
          const member = MEMBERS.find((item) => item.id === loan.memberId);
          const haystack = `${book?.title ?? ""} ${member?.name ?? ""} ${loan.id} ${book?.isbn ?? ""}`.toLowerCase();
          return (
            haystack.includes(query.toLowerCase()) &&
            (filter === "all" || (filter === "late" ? loan.dueIn < 0 : loan.dueIn >= 0 && loan.dueIn <= 3))
          );
        })
        .sort((a, b) => a.dueIn - b.dueIn),
    [books, filter, loans, query]
  );

  const lateCount = loans.filter((loan) => loan.dueIn < 0).length;
  const soonCount = loans.filter((loan) => loan.dueIn >= 0 && loan.dueIn <= 3).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs text-indigo-300 mb-2">
            <Layers size={13} />
            <span>Session Gestionnaire & Pilotage des stocks</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Centre de gestion</h2>
          <p className="mt-1 text-xs sm:text-sm text-white/50">
            Supervision du catalogue ({books.length} titres), diagrammes de stock en direct, scanner de code-barres et guichet d'emprunt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setScannedIsbnForModal("");
              setAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-black hover:bg-cyan-300 transition shadow-[0_0_20px_-4px_rgba(34,211,238,.6)]"
          >
            <Plus size={15} /> Nouveau livre
          </button>
        </div>
      </div>

      {/* Real-time Charts & Guichet Express Dashboard */}
      <div className="mb-8">
        <DashboardCharts
          books={books}
          loans={loans}
          onQuickLoan={handleQuickLoan}
          onQuickReturn={handleQuickReturn}
        />
      </div>

      {/* Main Grid: Barcode Scanner Hub + Loans Radar + Returns */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* BARCODE SCANNER HUB */}
        <div className="lg:col-span-4">
          <ScanHub
            books={books}
            loans={loans}
            onFoundLoan={setInspect}
            onAddCopies={handleAddCopies}
            onOpenNewBookModal={(isbn) => {
              setScannedIsbnForModal(isbn);
              setAddModalOpen(true);
            }}
          />
        </div>

        {/* RADAR DES PRÊTS ET RETARDS */}
        <div className="lg:col-span-8">
          <Glass className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-xl">Suivi des prêts en cours</h3>
                <p className="text-xs text-white/50">{loans.length} livres actuellement sortis</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70">
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Filtrer un prêt…"
                    aria-label="Rechercher un prêt"
                    className="w-32 bg-transparent outline-none placeholder:text-white/30"
                  />
                </label>

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as typeof filter)}
                  aria-label="Filtrer les prêts"
                  className="rounded-xl border border-white/10 bg-[#121827] px-3 py-1.5 text-xs text-white/75"
                >
                  <option value="all">Tous ({loans.length})</option>
                  <option value="late">En retard ({lateCount})</option>
                  <option value="soon">Échéance proche ({soonCount})</option>
                </select>
              </div>
            </div>

            <ul className="mt-3 divide-y divide-white/5 max-h-[460px] overflow-y-auto pr-1">
              {sorted.map((l, i) => {
                const b = books.find((x) => x.id === l.bookId);
                const m = MEMBERS.find((x) => x.id === l.memberId);
                if (!b || !m) return null;
                const lv = radar(l.dueIn);

                return (
                  <motion.li
                    key={l.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className="h-8 w-1 rounded-full shrink-0"
                        style={{ background: RADAR[lv].c }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{b.title}</p>
                        <p className="text-xs text-white/45 truncate">
                          {m.name} · {m.id} · Rayon {b.shelf}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <GlowBadge level={lv} text={dueText(l.dueIn)} />

                      <button
                        onClick={() => setInspect(l)}
                        aria-label={`Inspecter le prêt ${l.id}`}
                        className="rounded-xl bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/15 transition"
                      >
                        <User size={13} />
                      </button>

                      <button
                        onClick={() => notify(l)}
                        disabled={sending === l.id || (l.notified && lv === "ok")}
                        className={`rounded-xl px-2.5 py-1.5 text-xs transition flex items-center gap-1 ${
                          l.notified
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-indigo-400/15 text-indigo-200 hover:bg-indigo-400/25"
                        }`}
                      >
                        {sending === l.id ? (
                          "Envoi…"
                        ) : l.notified ? (
                          <>
                            <Check size={12} /> Notifié
                          </>
                        ) : (
                          <>
                            <Bell size={12} /> Relancer
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setRet(l)}
                        aria-label={`Enregistrer le retour de ${b.title}`}
                        className="rounded-xl bg-emerald-400/15 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/25 transition flex items-center gap-1"
                      >
                        <PackageCheck size={13} /> Restituer
                      </button>
                    </div>
                  </motion.li>
                );
              })}

              {!sorted.length && (
                <li className="py-8 text-center text-xs text-white/40">
                  Aucun prêt ne correspond à ces critères.
                </li>
              )}
            </ul>
          </Glass>
        </div>
      </div>

      {/* Modals */}
      <Inspector loan={inspect} books={books} onClose={() => setInspect(null)} />
      <ReturnStation
        loan={ret}
        book={ret ? books.find((book) => book.id === ret.bookId) ?? null : null}
        onClose={() => setRet(null)}
        onDone={doReturn}
      />
      <AddBookModal
        open={addModalOpen}
        initialIsbn={scannedIsbnForModal}
        onClose={() => setAddModalOpen(false)}
        onAddBook={handleAddNewBook}
      />
    </div>
  );
}
