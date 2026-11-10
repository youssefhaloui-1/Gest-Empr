import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Filter, Grid2X2, Heart, List, Search, SlidersHorizontal, X } from "lucide-react";
import { Book, MemberLoan, Reservation } from "../../types/library";
import { MEMBER_LOANS } from "../../data/mockData";
import { Glass, GHOST } from "../ui/primitives";
import { BookCard } from "./BookCard";
import { BookDetailsModal } from "./BookDetailsModal";
import { MemberDashboard } from "./MemberDashboard";
import { readStorage, STORAGE_KEYS, writeStorage } from "../../utils/storage";

type SortKey = "relevance" | "title" | "year-desc" | "availability";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function MemberView({
  books,
  setBooks,
  openSpot,
  query,
  setQuery,
  reservations,
  setReservations,
}: {
  books: Book[];
  setBooks: (updater: (items: Book[]) => Book[]) => void;
  openSpot: () => void;
  query: string;
  setQuery: (s: string) => void;
  reservations: Reservation[];
  setReservations: (updater: (items: Reservation[]) => Reservation[]) => void;
}) {
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(STORAGE_KEYS.favorites, []));
  const [toast, setToast] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loans] = useState<MemberLoan[]>(MEMBER_LOANS);
  const [field, setField] = useState("Tous les domaines");
  const [availability, setAvailability] = useState<"all" | "available" | "waiting">("all");
  const [year, setYear] = useState("Toutes les années");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [listMode, setListMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const fields = useMemo(() => ["Tous les domaines", ...new Set(books.map((book) => book.field))], [books]);
  const years = useMemo(
    () => ["Toutes les années", ...Array.from(new Set(books.map((book) => book.year))).sort((a, b) => b - a).map(String)],
    [books]
  );

  const list = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const filtered = books.filter((book) => {
      const haystack = normalize(`${book.title} ${book.author} ${book.field} ${book.isbn} ${book.shelf}`);
      return (
        terms.every((term) => haystack.includes(term)) &&
        (field === "Tous les domaines" || book.field === field) &&
        (availability === "all" || (availability === "available" ? book.stock > 0 : book.stock === 0)) &&
        (year === "Toutes les années" || String(book.year) === year) &&
        (!onlyFavorites || favorites.includes(book.id))
      );
    });
    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "year-desc") return b.year - a.year;
      if (sort === "availability") return b.stock - a.stock;
      return 0;
    });
  }, [availability, books, favorites, field, onlyFavorites, query, sort, year]);

  const activeFilters = field !== "Tous les domaines" || availability !== "all" || year !== "Toutes les années" || onlyFavorites;
  const toggleFavorite = (bookId: string) => {
    setFavorites((items) => items.includes(bookId) ? items.filter((id) => id !== bookId) : [...items, bookId]);
  };

  const reserve = (book: Book) => {
    if (reservations.some((item) => item.bookId === book.id)) return;
    const ready = book.stock > 0;
    setReservations((items) => [
      ...items,
      { bookId: book.id, createdOn: new Date().toISOString().slice(0, 10), status: ready ? "ready" : "active" },
    ]);
    if (ready) {
      setBooks((items) => items.map((item) => item.id === book.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));
    }
    setToast(ready ? `Réservation confirmée : ${book.title}` : `Ajouté à la file : ${book.title}`);
    window.setTimeout(() => setToast(null), 3000);
  };

  const cancelReservation = (bookId: string) => {
    const reservation = reservations.find((item) => item.bookId === bookId);
    setReservations((items) => items.filter((item) => item.bookId !== bookId));
    if (reservation?.status === "ready") {
      setBooks((items) => items.map((item) => item.id === bookId ? { ...item, stock: Math.min(item.total, item.stock + 1) } : item));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="pb-8 pt-10 text-center sm:pb-10 sm:pt-14">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
          Trouvez le livre,
          <br />
          réservez en un geste.
        </motion.h2>
        <button onClick={openSpot} aria-label="Ouvrir la recherche du catalogue" className="mx-auto mt-7 flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-4 text-left text-white/55 backdrop-blur-xl transition hover:border-indigo-400/40">
          <Search size={18} />
          <span className="flex-1 text-sm">Rechercher un ouvrage…</span>
          <kbd className="hidden rounded bg-white/10 px-2 py-0.5 text-xs sm:inline">Ctrl K</kbd>
        </button>
        <label className="mx-auto mt-4 flex w-full max-w-xl items-center gap-2 rounded-full border border-white/10 bg-black/10 px-4 py-2 text-left">
          <Search size={15} className="text-white/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par titre, auteur, domaine, ISBN…" aria-label="Rechercher dans le catalogue" type="search" className="w-full bg-transparent text-sm text-white/75 outline-none placeholder:text-white/25" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche"><X size={15} /></button>}
        </label>
      </div>

      <Glass className="mb-6 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowFilters((value) => !value)} className={`${GHOST} inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs`} aria-expanded={showFilters}>
            <SlidersHorizontal size={14} /> Filtres {activeFilters && <span className="rounded-full bg-indigo-400 px-1.5 text-[10px] text-white">!</span>}
          </button>
          <button type="button" onClick={() => setOnlyFavorites((value) => !value)} aria-pressed={onlyFavorites} className={`${onlyFavorites ? "bg-rose-400/15 text-rose-200" : "text-white/60"} inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs`}>
            <Heart size={14} fill={onlyFavorites ? "currentColor" : "none"} /> Favoris ({favorites.length})
          </button>
          <span className="w-full text-xs text-white/45 sm:ml-auto sm:w-auto">{list.length} résultat{list.length === 1 ? "" : "s"}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Trier le catalogue" className="rounded-full border border-white/10 bg-[#121827] px-3 py-2 text-xs text-white/75">
            <option value="relevance">Pertinence</option>
            <option value="title">Titre A–Z</option>
            <option value="year-desc">Plus récent</option>
            <option value="availability">Disponibilité</option>
          </select>
          <div className="flex rounded-full border border-white/10 p-1" aria-label="Mode d'affichage">
            <button type="button" onClick={() => setListMode("grid")} aria-label="Affichage en grille" aria-pressed={listMode === "grid"} className={`rounded-full p-1.5 ${listMode === "grid" ? "bg-indigo-500/70" : "text-white/45"}`}><Grid2X2 size={14} /></button>
            <button type="button" onClick={() => setListMode("list")} aria-label="Affichage en liste" aria-pressed={listMode === "list"} className={`rounded-full p-1.5 ${listMode === "list" ? "bg-indigo-500/70" : "text-white/45"}`}><List size={14} /></button>
          </div>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-3 overflow-hidden pt-4 sm:grid-cols-3">
              <label className="text-xs text-white/55">Domaine<select value={field} onChange={(e) => setField(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80">{fields.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs text-white/55">Disponibilité<select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80"><option value="all">Tous les stocks</option><option value="available">Disponible</option><option value="waiting">File d'attente</option></select></label>
              <label className="text-xs text-white/55">Année<select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80">{years.map((item) => <option key={item}>{item}</option>)}</select></label>
            </motion.div>
          )}
        </AnimatePresence>
      </Glass>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Chargement du catalogue">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5" />)}</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center"><Filter className="mx-auto mb-3 text-white/35" /><p className="text-sm text-white/60">Aucun ouvrage ne correspond à ces critères.</p><button type="button" onClick={() => { setQuery(""); setField("Tous les domaines"); setAvailability("all"); setYear("Toutes les années"); setOnlyFavorites(false); }} className={`${GHOST} mt-4 rounded-full text-xs`}>Réinitialiser les filtres</button></div>
      ) : (
        <div className={listMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3"}>
          {list.map((book, index) => <BookCard key={book.id} b={book} i={index} reserved={reservations.some((item) => item.bookId === book.id)} favorite={favorites.includes(book.id)} listMode={listMode} onFavorite={() => toggleFavorite(book.id)} onReserve={() => reserve(book)} onOpen={() => setSelectedBook(book)} />)}
        </div>
      )}

      <MemberDashboard books={books} loans={loans} reservations={reservations} onCancelReservation={cancelReservation} />
      <AnimatePresence>{toast && <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} role="status" className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"><Glass className="flex items-center gap-3 bg-[#0f1320]/95 px-5 py-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 text-black"><Check size={16} /></span><span className="max-w-[70vw] text-sm">{toast}</span></Glass></motion.div>}</AnimatePresence>
      <BookDetailsModal book={selectedBook} reserved={selectedBook ? reservations.some((item) => item.bookId === selectedBook.id) : false} onClose={() => setSelectedBook(null)} onReserve={() => selectedBook && reserve(selectedBook)} />
    </div>
  );
}
