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
  Minus,
  Edit,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
  Barcode,
  MapPin,
  X,
  Archive,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Book, Loan, Cond, radar, RADAR, ReturnRecord, dueText } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge } from "../ui/primitives";
import { ScanHub } from "./ScanHub";
import { Inspector } from "./Inspector";
import { ReturnStation } from "./ReturnStation";
import { DashboardCharts } from "./DashboardCharts";
import { AddBookModal } from "./AddBookModal";
import { EditBookModal } from "./EditBookModal";
import { DeleteBookModal } from "./DeleteBookModal";

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

  // Stock inventory table filters
  const [stockQuery, setStockQuery] = useState("");
  const [stockFieldFilter, setStockFieldFilter] = useState("Tous");
  const [stockAvailabilityFilter, setStockAvailabilityFilter] = useState<"all" | "available" | "empty">("all");

  // Newly added / edited books tracking for instant visual feedback
  const [newlyAddedIds, setNewlyAddedIds] = useState<string[]>([]);
  const [addedBookBanner, setAddedBookBanner] = useState<{
    title: string;
    shelf: string;
    copies: number;
    isbn: string;
    action?: "add" | "edit" | "delete";
  } | null>(null);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scannedIsbnForModal, setScannedIsbnForModal] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

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

  // Restock copies from Scanner or Table (+1 ex.)
  const handleAddCopies = (bookId: string, quantity: number) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, stock: b.stock + quantity, total: b.total + quantity }
          : b
      )
    );
  };

  // Decrement copies from Table (-1 ex.)
  const handleRemoveCopy = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        if (b.stock <= 0) return b;
        const newStock = Math.max(0, b.stock - 1);
        const newTotal = Math.max(newStock, b.total - 1);
        return { ...b, stock: newStock, total: newTotal };
      })
    );
  };

  // Add new book to catalog
  const handleAddNewBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setNewlyAddedIds((prev) => [newBook.id, ...prev]);
    setAddedBookBanner({
      title: newBook.title,
      shelf: newBook.shelf,
      copies: newBook.total,
      isbn: newBook.isbn,
      action: "add",
    });
    setTimeout(() => {
      setAddedBookBanner(null);
    }, 8000);
  };

  // Edit existing book
  const handleSaveEdit = (updatedBook: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
    setAddedBookBanner({
      title: updatedBook.title,
      shelf: updatedBook.shelf,
      copies: updatedBook.stock,
      isbn: updatedBook.isbn,
      action: "edit",
    });
    setTimeout(() => {
      setAddedBookBanner(null);
    }, 6000);
  };

  // Delete book from inventory
  const handleConfirmDelete = (bookId: string) => {
    const bookToDelete = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setLoans((prev) => prev.filter((l) => l.bookId !== bookId));
    setDeletingBook(null);

    if (bookToDelete) {
      setAddedBookBanner({
        title: bookToDelete.title,
        shelf: bookToDelete.shelf,
        copies: 0,
        isbn: bookToDelete.isbn,
        action: "delete",
      });
      setTimeout(() => {
        setAddedBookBanner(null);
      }, 5000);
    }
  };

  // Loans radar list filter
  const sortedLoans = useMemo(
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

  // Stock inventory table calculations & filter
  const fields = useMemo(() => {
    return ["Tous", ...Array.from(new Set(books.map((b) => b.field))).sort()];
  }, [books]);

  const filteredStockBooks = useMemo(() => {
    const q = stockQuery.toLowerCase().trim();
    return books.filter((b) => {
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.shelf.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q);

      const matchesField = stockFieldFilter === "Tous" || b.field === stockFieldFilter;
      const matchesAvail =
        stockAvailabilityFilter === "all" ||
        (stockAvailabilityFilter === "available" ? b.stock > 0 : b.stock === 0);

      return matchesSearch && matchesField && matchesAvail;
    });
  }, [books, stockAvailabilityFilter, stockFieldFilter, stockQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      {/* Dynamic Feedback Banner for Add / Edit / Delete */}
      <AnimatePresence>
        {addedBookBanner && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            className={`mb-6 rounded-2xl border p-4 text-xs flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl ${
              addedBookBanner.action === "delete"
                ? "border-rose-400/50 bg-gradient-to-r from-rose-950/80 to-black/80 text-rose-200 shadow-[0_0_35px_rgba(244,63,94,.3)]"
                : addedBookBanner.action === "edit"
                ? "border-indigo-400/50 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 text-indigo-200 shadow-[0_0_35px_rgba(99,102,241,.3)]"
                : "border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,.35)]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-bold ${
                  addedBookBanner.action === "delete"
                    ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,.6)]"
                    : addedBookBanner.action === "edit"
                    ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,.6)]"
                    : "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,.6)]"
                }`}
              >
                {addedBookBanner.action === "delete" ? (
                  <Trash2 size={16} />
                ) : addedBookBanner.action === "edit" ? (
                  <Edit size={16} />
                ) : (
                  <Sparkles size={18} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {addedBookBanner.action === "delete"
                    ? `Ouvrage « ${addedBookBanner.title} » retiré du stock avec succès.`
                    : addedBookBanner.action === "edit"
                    ? `Modifications enregistrées pour « ${addedBookBanner.title} ».`
                    : `Ouvrage « ${addedBookBanner.title} » ajouté avec succès au catalogue !`}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                  {addedBookBanner.action === "delete"
                    ? "Le livre et ses données associées ont été définitivement retirés du catalogue."
                    : `${addedBookBanner.copies} exemplaire(s) · Rayon ${addedBookBanner.shelf} · ISBN: ${addedBookBanner.isbn}. Données immédiatement synchronisées en temps réel.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddedBookBanner(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg shrink-0"
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs text-indigo-300 mb-2">
            <Layers size={13} />
            <span>Session Gestionnaire & Pilotage des stocks</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Centre de gestion</h2>
          <p className="mt-1 text-xs sm:text-sm text-white/50">
            Supervision du catalogue ({books.length} titres en stock), diagrammes de stock en direct, scanner de code-barres et guichet d'emprunt.
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
      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        {/* BARCODE SCANNER HUB */}
        <div className="lg:col-span-5">
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
        <div className="lg:col-span-7">
          <Glass className="p-4 sm:p-5 h-full flex flex-col justify-between">
            <div>
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
                      className="w-28 sm:w-32 bg-transparent outline-none placeholder:text-white/30"
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

              <ul className="mt-3 divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
                {sortedLoans.map((l, i) => {
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

                {!sortedLoans.length && (
                  <li className="py-8 text-center text-xs text-white/40">
                    Aucun prêt ne correspond à ces critères.
                  </li>
                )}
              </ul>
            </div>
          </Glass>
        </div>
      </div>

      {/* TABLEAU DU STOCK & INVENTAIRE GÉNÉRAL (LIVE STOCK TABLE WITH EDIT & DELETE) */}
      <Glass className="p-5 sm:p-6" glow="rgba(34,211,238,.25)">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Archive size={20} className="text-cyan-400" />
              <h3 className="font-display text-xl">Tableau du stock & Inventaire général</h3>
            </div>
            <p className="mt-1 text-xs text-white/55">
              Édition avancée des fiches, suppression et incrémentation/décrémentation rapide du stock disponible ({books.length} titres).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search filter in stock table */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={stockQuery}
                onChange={(e) => setStockQuery(e.target.value)}
                placeholder="Rechercher titre, ISBN, rayon…"
                className="w-48 sm:w-56 rounded-xl border border-white/15 bg-black/40 py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Discipline Filter */}
            <select
              value={stockFieldFilter}
              onChange={(e) => setStockFieldFilter(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#121827] px-3 py-1.5 text-xs text-white/80 outline-none"
            >
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f === "Tous" ? "Toutes disciplines" : f}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={stockAvailabilityFilter}
              onChange={(e) => setStockAvailabilityFilter(e.target.value as typeof stockAvailabilityFilter)}
              className="rounded-xl border border-white/15 bg-[#121827] px-3 py-1.5 text-xs text-white/80 outline-none"
            >
              <option value="all">Tous états ({books.length})</option>
              <option value="available">En rayon uniquement</option>
              <option value="empty">Rupture / Tous sortis</option>
            </select>
          </div>
        </div>

        {/* Responsive Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/45 uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Ouvrage & Auteur</th>
                <th className="pb-3">Discipline</th>
                <th className="pb-3">Code ISBN</th>
                <th className="pb-3">Rayon</th>
                <th className="pb-3 min-w-[130px]">Stock en rayon</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 pr-2 text-right">Actions d'administration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStockBooks.map((book) => {
                const isNewlyAdded = newlyAddedIds.includes(book.id);
                const percent = book.total > 0 ? Math.round((book.stock / book.total) * 100) : 0;
                const isAvailable = book.stock > 0;

                return (
                  <tr
                    key={book.id}
                    className={`transition-colors ${
                      isNewlyAdded
                        ? "bg-cyan-500/15 hover:bg-cyan-500/20"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Title & Author */}
                    <td className="py-3 pl-2 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {isNewlyAdded && (
                          <span className="shrink-0 rounded bg-cyan-400 px-1.5 py-0.5 text-[10px] font-bold text-black animate-pulse">
                            ✨ Nouveau
                          </span>
                        )}
                        <div className="truncate">
                          <p className="font-medium text-white truncate" title={book.title}>
                            {book.title}
                          </p>
                          <p className="text-[11px] text-white/45 truncate">
                            {book.author} · {book.year}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Discipline */}
                    <td className="py-3 text-white/70">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/5 text-[11px]">
                        {book.field}
                      </span>
                    </td>

                    {/* ISBN */}
                    <td className="py-3 font-mono text-[11px] text-cyan-300/80">
                      {book.isbn}
                    </td>

                    {/* Shelf */}
                    <td className="py-3 font-mono text-[11px] text-amber-300">
                      {book.shelf}
                    </td>

                    {/* Stock / Total with Quick Adjust Buttons */}
                    <td className="py-3">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-1.5">
                            {/* Decrement button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCopy(book.id)}
                              disabled={book.stock <= 0}
                              title="Retirer 1 exemplaire du stock disponible"
                              className="h-5 w-5 rounded bg-white/10 hover:bg-rose-500/30 hover:text-rose-200 transition grid place-items-center text-white/70 disabled:opacity-30 disabled:hover:bg-white/10"
                            >
                              <Minus size={10} />
                            </button>

                            <strong className={isAvailable ? "text-emerald-300" : "text-rose-400"}>
                              {book.stock}
                            </strong>

                            {/* Increment button */}
                            <button
                              type="button"
                              onClick={() => handleAddCopies(book.id, 1)}
                              title="Ajouter 1 exemplaire au stock disponible"
                              className="h-5 w-5 rounded bg-white/10 hover:bg-emerald-500/30 hover:text-emerald-200 transition grid place-items-center text-white/70"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <span className="text-white/40">/ {book.total}</span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent > 50
                                ? "bg-emerald-400"
                                : percent > 0
                                ? "bg-amber-400"
                                : "bg-rose-500"
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 text-[10px] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          En rayon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-400/30 px-2 py-0.5 text-[10px] text-rose-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          Tous sortis
                        </span>
                      )}
                    </td>

                    {/* Action Column: Only Edit and Delete buttons */}
                    <td className="py-3 pr-2 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Edit Book Modal trigger */}
                        <button
                          type="button"
                          onClick={() => setEditingBook(book)}
                          title="Modifier la fiche et les métadonnées de l'ouvrage"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/35 transition"
                        >
                          <Edit size={11} />
                          <span>Éditer</span>
                        </button>

                        {/* Delete Book Modal trigger */}
                        <button
                          type="button"
                          onClick={() => setDeletingBook(book)}
                          title="Supprimer cet ouvrage du stock"
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 border border-rose-400/30 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/30 hover:border-rose-400/50 transition"
                        >
                          <Trash2 size={12} />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filteredStockBooks.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-white/40">
                    Aucun livre ne correspond aux filtres de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Glass>

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
      <EditBookModal
        book={editingBook}
        open={Boolean(editingBook)}
        onClose={() => setEditingBook(null)}
        onSave={handleSaveEdit}
      />
      <DeleteBookModal
        book={deletingBook}
        activeLoansCount={loans.filter((l) => l.bookId === deletingBook?.id).length}
        open={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
