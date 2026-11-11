import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Filter,
  Grid2X2,
  Heart,
  List,
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  MapPin,
  Info,
  Sparkles,
} from "lucide-react";
import { Book, MemberLoan } from "../../types/library";
import { MEMBER_LOANS } from "../../data/mockData";
import { Glass, GHOST } from "../ui/primitives";
import { BookCard } from "./BookCard";
import { BookDetailsModal } from "./BookDetailsModal";
import { MemberDashboard } from "./MemberDashboard";
import { readStorage, STORAGE_KEYS, writeStorage } from "../../utils/storage";

type SortKey = "relevance" | "title" | "year-desc" | "availability";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function MemberView({
  books,
  openSpot,
  query,
  setQuery,
}: {
  books: Book[];
  openSpot: () => void;
  query: string;
  setQuery: (s: string) => void;
}) {
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.favorites, [])
  );
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loans] = useState<MemberLoan[]>(MEMBER_LOANS);
  const [field, setField] = useState("Tous les domaines");
  const [availability, setAvailability] = useState<"all" | "available" | "borrowed">("all");
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
    const timer = window.setTimeout(() => setLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, []);

  const fields = useMemo(
    () => ["Tous les domaines", ...Array.from(new Set(books.map((book) => book.field))).sort()],
    [books]
  );

  const years = useMemo(
    () => [
      "Toutes les années",
      ...Array.from(new Set(books.map((book) => book.year))).sort((a, b) => b - a).map(String),
    ],
    [books]
  );

  // Dynamic search across Title, Author, Field, ISBN, Shelf
  const list = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const filtered = books.filter((book) => {
      const haystack = normalize(
        `${book.title} ${book.author} ${book.field} ${book.isbn} ${book.shelf} ${book.publisher}`
      );
      const matchesSearch = terms.every((term) => haystack.includes(term));
      const matchesField = field === "Tous les domaines" || book.field === field;
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" ? book.stock > 0 : book.stock === 0);
      const matchesYear = year === "Toutes les années" || String(book.year) === year;
      const matchesFavorites = !onlyFavorites || favorites.includes(book.id);

      return matchesSearch && matchesField && matchesAvailability && matchesYear && matchesFavorites;
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "year-desc") return b.year - a.year;
      if (sort === "availability") return b.stock - a.stock;
      return 0;
    });
  }, [availability, books, favorites, field, onlyFavorites, query, sort, year]);

  const activeFilters =
    field !== "Tous les domaines" ||
    availability !== "all" ||
    year !== "Toutes les années" ||
    onlyFavorites;

  const toggleFavorite = (bookId: string) => {
    setFavorites((items) =>
      items.includes(bookId) ? items.filter((id) => id !== bookId) : [...items, bookId]
    );
  };

  const availableBooksCount = books.filter((b) => b.stock > 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      {/* Hero Section */}
      <div className="pb-8 pt-8 text-center sm:pb-10 sm:pt-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300 mb-4">
          <BookOpen size={14} />
          <span>Catalogue universitaire · {books.length} ouvrages référencés</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl leading-[1.1] sm:text-4xl md:text-6xl text-white"
        >
          Explorez le catalogue,
          <br />
          <span className="text-emerald-300">vérifiez la disponibilité en rayon.</span>
        </motion.h2>

        <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-white/60">
          Recherchez parmi l'ensemble des 50 ouvrages académiques et littéraires. Pour emprunter un livre,
          repérez son numéro de rayon et présentez-vous au guichet du bibliothécaire.
        </p>

        {/* Dynamic Search Bar */}
        <div className="mx-auto mt-7 max-w-2xl">
          <div className="relative flex items-center rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 shadow-2xl backdrop-blur-xl transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
            <Search size={20} className="text-emerald-400 shrink-0 mr-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, auteur, genre, code ISBN (ex: 978…), rayon…"
              aria-label="Recherche dynamique dans le catalogue"
              type="search"
              className="w-full bg-transparent text-sm sm:text-base text-white outline-none placeholder:text-white/35"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="text-white/45 hover:text-white p-1 rounded-md"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={openSpot}
              type="button"
              className="ml-2 hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white/50 hover:text-white"
            >
              Ctrl K
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-white/40 mr-1 text-[11px]">Genres populaires :</span>
            {["Informatique", "Littérature", "Physique", "Philosophie", "Droit", "Économie", "Histoire"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setField(field === cat ? "Tous les domaines" : cat)}
                  className={`rounded-full px-2.5 py-1 transition ${
                    field === cat
                      ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="mb-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3.5 sm:p-4 text-xs text-indigo-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info size={16} className="shrink-0 text-indigo-300" />
          <span>
            <strong>Modalités d'emprunt :</strong> Conformément au règlement de l'université, les réservations en ligne sont désactivées. Les prêts se font sur place au guichet physique sur présentation de la carte étudiant.
          </span>
        </div>
        <span className="hidden sm:inline-flex shrink-0 font-medium text-indigo-300 font-mono">
          {availableBooksCount} livres dispo aujourd'hui
        </span>
      </div>

      {/* Filters & Display Controls */}
      <Glass className="mb-6 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className={`${GHOST} inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs`}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={14} /> Filtres{" "}
            {activeFilters && <span className="rounded-full bg-emerald-400 px-1.5 text-[10px] text-black font-bold">Actif</span>}
          </button>

          <button
            type="button"
            onClick={() => setOnlyFavorites((value) => !value)}
            aria-pressed={onlyFavorites}
            className={`${
              onlyFavorites ? "bg-rose-400/20 text-rose-200 border-rose-400/40" : "text-white/60"
            } inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs`}
          >
            <Heart size={14} fill={onlyFavorites ? "currentColor" : "none"} /> Favoris ({favorites.length})
          </button>

          <span className="w-full text-xs text-white/50 sm:ml-auto sm:w-auto">
            <strong>{list.length}</strong> ouvrage{list.length > 1 ? "s" : ""} trouvé{list.length > 1 ? "s" : ""}
          </span>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Trier le catalogue"
            className="rounded-full border border-white/10 bg-[#121827] px-3 py-2 text-xs text-white/80"
          >
            <option value="relevance">Tri : Pertinence</option>
            <option value="title">Tri : Titre A–Z</option>
            <option value="year-desc">Tri : Plus récent</option>
            <option value="availability">Tri : Disponibilité en rayon</option>
          </select>

          <div className="flex rounded-full border border-white/10 p-1" aria-label="Mode d'affichage">
            <button
              type="button"
              onClick={() => setListMode("grid")}
              aria-label="Affichage en grille"
              aria-pressed={listMode === "grid"}
              className={`rounded-full p-1.5 transition ${
                listMode === "grid" ? "bg-emerald-500/80 text-black" : "text-white/45"
              }`}
            >
              <Grid2X2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setListMode("list")}
              aria-label="Affichage en liste"
              aria-pressed={listMode === "list"}
              className={`rounded-full p-1.5 transition ${
                listMode === "list" ? "bg-emerald-500/80 text-black" : "text-white/45"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid gap-3 overflow-hidden pt-4 sm:grid-cols-3 border-t border-white/5 mt-3"
            >
              <label className="text-xs text-white/55">
                Domaine / Discipline
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80"
                >
                  {fields.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-white/55">
                Statut de disponibilité
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as typeof availability)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80"
                >
                  <option value="all">Tous les ouvrages (disponibles et sortis)</option>
                  <option value="available">Disponible en rayon uniquement</option>
                  <option value="borrowed">Actuellement sortis / indisponibles</option>
                </select>
              </label>

              <label className="text-xs text-white/55">
                Année d'édition
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#121827] px-3 py-2 text-sm text-white/80"
                >
                  {years.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </Glass>

      {/* Book Grid / List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Chargement du catalogue">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <Filter className="mx-auto mb-3 text-white/35" size={28} />
          <p className="text-base font-medium text-white/80">Aucun livre ne correspond à votre recherche.</p>
          <p className="text-xs text-white/50 mt-1">
            Essayez de rechercher un autre mot-clé ou réinitialisez les filtres.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setField("Tous les domaines");
              setAvailability("all");
              setYear("Toutes les années");
              setOnlyFavorites(false);
            }}
            className={`${GHOST} mt-4 rounded-full text-xs px-4 py-2 border border-white/10`}
          >
            Effacer les filtres de recherche
          </button>
        </div>
      ) : (
        <div className={listMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3"}>
          {list.map((book, index) => (
            <BookCard
              key={book.id}
              b={book}
              i={index}
              favorite={favorites.includes(book.id)}
              listMode={listMode}
              onFavorite={() => toggleFavorite(book.id)}
              onOpen={() => setSelectedBook(book)}
            />
          ))}
        </div>
      )}

      {/* Member Tracking & Rules */}
      <MemberDashboard books={books} loans={loans} />

      {/* Book Details Modal */}
      <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
}
