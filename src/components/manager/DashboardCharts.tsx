import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart as PieIcon,
  BarChart3,
  Layers,
  BookOpen,
  ArrowUpRight,
  Search,
  Check,
  MapPin,
  Barcode,
  UserCheck,
  Plus,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { Book, Loan } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge } from "../ui/primitives";

export function DashboardCharts({
  books,
  loans,
  onQuickLoan,
  onQuickReturn,
}: {
  books: Book[];
  loans: Loan[];
  onQuickLoan: (bookId: string, memberId: string) => void;
  onQuickReturn: (loanId: string) => void;
}) {
  const [deskQuery, setDeskQuery] = useState("");
  const [selectedDeskBook, setSelectedDeskBook] = useState<Book | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(MEMBERS[0].id);
  const [loanSuccessMessage, setLoanSuccessMessage] = useState<string | null>(null);

  // Stock calculations
  const totalCopies = useMemo(
    () => books.reduce((acc, b) => acc + (b.total || 0), 0),
    [books]
  );
  const availableCopies = useMemo(
    () => books.reduce((acc, b) => acc + (b.stock || 0), 0),
    [books]
  );
  const borrowedCopies = Math.max(0, totalCopies - availableCopies);
  const lateLoansCount = useMemo(
    () => loans.filter((l) => l.dueIn < 0).length,
    [loans]
  );
  const onTimeLoansCount = Math.max(0, borrowedCopies - lateLoansCount);

  const availabilityRate = totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0;
  const borrowingRate = totalCopies > 0 ? Math.round((borrowedCopies / totalCopies) * 100) : 0;

  // Domain breakdown for Bar Chart
  const fieldStats = useMemo(() => {
    const stats: Record<string, { total: number; available: number; borrowed: number }> = {};
    books.forEach((b) => {
      if (!stats[b.field]) {
        stats[b.field] = { total: 0, available: 0, borrowed: 0 };
      }
      stats[b.field].total += b.total;
      stats[b.field].available += b.stock;
      stats[b.field].borrowed += b.total - b.stock;
    });

    return Object.entries(stats)
      .map(([field, data]) => ({ field, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [books]);

  // Donut chart angles calculation
  const donutData = useMemo(() => {
    if (totalCopies === 0) return [];
    const availableAngle = (availableCopies / totalCopies) * 360;
    const borrowedAngle = (borrowedCopies / totalCopies) * 360;

    return [
      {
        id: "available",
        label: "Disponibles sur étagère",
        count: availableCopies,
        percent: availabilityRate,
        color: "#10b981", // Emerald
        bgClass: "bg-emerald-400",
      },
      {
        id: "borrowed",
        label: "Actuellement empruntés",
        count: borrowedCopies,
        percent: borrowingRate,
        color: "#6366f1", // Indigo
        bgClass: "bg-indigo-400",
      },
    ];
  }, [availableCopies, borrowedCopies, availabilityRate, borrowingRate, totalCopies]);

  // Desk instant search
  const deskResults = useMemo(() => {
    if (!deskQuery.trim()) return [];
    const q = deskQuery.toLowerCase().trim();
    return books
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.field.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.shelf.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [books, deskQuery]);

  const handleRegisterLoan = (book: Book) => {
    if (book.stock <= 0) return;
    onQuickLoan(book.id, selectedMemberId);
    const member = MEMBERS.find((m) => m.id === selectedMemberId);
    setLoanSuccessMessage(
      `Prêt enregistré au guichet : « ${book.title} » confié à ${member?.name ?? selectedMemberId}.`
    );
    setSelectedDeskBook(null);
    setTimeout(() => setLoanSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* KPI Top Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Glass className="p-5" glow="rgba(99,102,241,.35)">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider font-medium">Total Exemplaires</span>
            <Layers size={18} className="text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-white">{totalCopies}</span>
            <span className="text-xs text-white/45">sur {books.length} titres</span>
          </div>
          <p className="mt-2 text-xs text-indigo-300/80">Fonds documentaire complet</p>
        </Glass>

        <Glass className="p-5" glow="rgba(16,185,129,.35)">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider font-medium">Disponibles en rayon</span>
            <BookOpen size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-emerald-300">{availableCopies}</span>
            <span className="text-xs text-emerald-300/70 font-mono font-bold">({availabilityRate}%)</span>
          </div>
          <p className="mt-2 text-xs text-white/50">Prêts pour emprunt immédiat</p>
        </Glass>

        <Glass className="p-5" glow="rgba(245,158,11,.35)">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider font-medium">Empruntés / Sortis</span>
            <ArrowUpRight size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-amber-300">{borrowedCopies}</span>
            <span className="text-xs text-amber-300/70 font-mono font-bold">({borrowingRate}%)</span>
          </div>
          <p className="mt-2 text-xs text-white/50">En circulation chez les lecteurs</p>
        </Glass>

        <Glass className="p-5" glow="rgba(244,63,94,.35)">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider font-medium">Retards critiques</span>
            <AlertCircle size={18} className="text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-rose-300">{lateLoansCount}</span>
            <span className="text-xs text-white/45">prêts dépassés</span>
          </div>
          <p className="mt-2 text-xs text-rose-300/80">Nécessite relance guichet</p>
        </Glass>
      </div>

      {/* Charts Section: Pie/Donut Chart & Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* DONUT CHART */}
        <Glass className="p-5 sm:p-6 lg:col-span-5" glow="rgba(99,102,241,.25)">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-400" />
              <h3 className="font-display text-lg sm:text-xl">État du stock en temps réel</h3>
            </div>
            <span className="text-xs font-mono text-white/40">{totalCopies} volumes</span>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            {/* SVG Donut Chart */}
            <div className="relative h-56 w-56">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-white/10"
                  strokeWidth="12"
                  fill="transparent"
                />

                {/* Available segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${(availabilityRate / 100) * 238.76} 238.76`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />

                {/* Borrowed segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#6366f1"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${(borrowingRate / 100) * 238.76} 238.76`}
                  strokeDashoffset={`-${(availabilityRate / 100) * 238.76}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider text-white/40">Total Stock</span>
                <span className="font-display text-3xl font-bold text-white">{totalCopies}</span>
                <span className="text-[11px] text-emerald-300">{availabilityRate}% en rayon</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 grid w-full grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                <div className="flex items-center gap-1.5 font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>En rayon</span>
                </div>
                <p className="mt-1 font-display text-xl text-emerald-200">
                  {availableCopies} <span className="text-xs text-white/45">({availabilityRate}%)</span>
                </p>
              </div>

              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2.5">
                <div className="flex items-center gap-1.5 font-medium text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span>Empruntés</span>
                </div>
                <p className="mt-1 font-display text-xl text-indigo-200">
                  {borrowedCopies} <span className="text-xs text-white/45">({borrowingRate}%)</span>
                </p>
              </div>
            </div>
          </div>
        </Glass>

        {/* BAR CHART */}
        <Glass className="p-5 sm:p-6 lg:col-span-7" glow="rgba(16,185,129,.25)">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" />
              <h3 className="font-display text-lg sm:text-xl">Distribution des stocks par discipline</h3>
            </div>
            <span className="text-xs text-white/40">Disponibles vs Empruntés</span>
          </div>

          <div className="space-y-3 pt-2">
            {fieldStats.slice(0, 7).map((item) => {
              const maxTotal = Math.max(...fieldStats.map((f) => f.total), 1);
              const availablePct = Math.round((item.available / item.total) * 100);
              const totalBarWidth = (item.total / maxTotal) * 100;

              return (
                <div key={item.field} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/85">{item.field}</span>
                    <span className="text-white/45 font-mono">
                      <strong className="text-emerald-300">{item.available}</strong> dispo / {item.total} total
                    </span>
                  </div>

                  {/* Stacked Bar */}
                  <div className="h-3 w-full rounded-full bg-black/40 p-0.5 overflow-hidden flex">
                    <div
                      style={{ width: `${(item.available / item.total) * totalBarWidth}%` }}
                      className="h-full rounded-l-full bg-emerald-400 transition-all duration-500"
                      title={`${item.available} exemplaires disponibles`}
                    />
                    <div
                      style={{ width: `${(item.borrowed / item.total) * totalBarWidth}%` }}
                      className="h-full rounded-r-full bg-indigo-500/80 transition-all duration-500"
                      title={`${item.borrowed} exemplaires empruntés`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-end gap-4 border-t border-white/10 pt-3 text-[11px] text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Exemplaires disponibles
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Exemplaires empruntés
            </span>
          </div>
        </Glass>
      </div>

      {/* GUICHET EXPRESS: Reader In-Person Requests Tool */}
      <Glass className="p-5 sm:p-6" glow="rgba(34,211,238,.35)">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck size={20} className="text-cyan-400" />
              <h3 className="font-display text-xl">Guichet Express · Consultation & Prêt au comptoir</h3>
            </div>
            <p className="mt-1 text-xs text-white/55">
              Un lecteur se présente au guichet ? Recherchez instantanément l'ouvrage par titre, auteur ou code-barres pour vérifier le stock et lui attribuer un prêt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/45">Lecteur au guichet :</span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#121827] px-3 py-1.5 text-xs text-white/80"
            >
              {MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            value={deskQuery}
            onChange={(e) => setDeskQuery(e.target.value)}
            placeholder="Tapez le titre, l'auteur ou le code-barres du livre demandé par le lecteur…"
            className="w-full rounded-2xl border border-white/15 bg-black/40 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        {/* Loan success banner */}
        <AnimatePresence>
          {loanSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-3 text-xs text-emerald-200"
            >
              <Check size={16} className="text-emerald-300" />
              <span>{loanSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results list */}
        {deskResults.length > 0 && (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {deskResults.map((book) => {
              const isAvailable = book.stock > 0;
              return (
                <div
                  key={book.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 flex flex-col justify-between hover:bg-white/[0.06] transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-white line-clamp-1">{book.title}</p>
                      {isAvailable ? (
                        <GlowBadge level="ok" text={`${book.stock}/${book.total} en rayon`} />
                      ) : (
                        <GlowBadge level="yellow" text="Tous sortis (0)" />
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{book.author} · {book.field}</p>

                    <div className="mt-2 flex items-center justify-between text-xs text-cyan-300/80 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> Rayon {book.shelf}
                      </span>
                      <span className="flex items-center gap-1 text-white/40">
                        <Barcode size={12} /> {book.isbn}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-end">
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => handleRegisterLoan(book)}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/30 transition"
                      >
                        <UserCheck size={14} /> Enregistrer le prêt sur place
                      </button>
                    ) : (
                      <span className="text-xs text-amber-300/80 italic">
                        Aucun exemplaire disponible au rayon
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deskQuery && deskResults.length === 0 && (
          <p className="mt-4 text-center text-xs text-white/40 py-2">
            Aucun livre ne correspond à « {deskQuery} ».
          </p>
        )}
      </Glass>
    </div>
  );
}
