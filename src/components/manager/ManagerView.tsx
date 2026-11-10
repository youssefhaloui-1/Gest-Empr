import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Radar, Search, User, Send, Check, Bell, PackageCheck } from "lucide-react";
import { Book, Loan, Cond, radar, RADAR, ReturnRecord, dueText } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge, Magnetic } from "../ui/primitives";
import { ScanHub } from "./ScanHub";
import { Inspector } from "./Inspector";
import { ReturnStation } from "./ReturnStation";

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

  const counts = (["yellow", "orange", "red"] as const).map((k) => ({
    k,
    n: loans.filter((l) => radar(l.dueIn) === k).length,
  }));

  const notify = (l: Loan) => {
    setSending(l.id);
    setTimeout(() => {
      setSending(null);
      setLoans((ls) => ls.map((x) => (x.id === l.id ? { ...x, notified: true } : x)));
    }, 1600);
  };

  const doReturn = (c: Cond) => {
    const l = ret!;
    setLoans((ls) => ls.filter((x) => x.id !== l.id));
    setBooks((bs) => bs.map((b) => (b.id === l.bookId && c !== "Endommagé" ? { ...b, stock: Math.min(b.total, b.stock + 1) } : b)));
    setReturnHistory((items) => [{ id: `RET-${Date.now()}`, loanId: l.id, bookId: l.bookId, condition: c, returnedOn: new Date().toISOString().slice(0, 10) }, ...items]);
  };

  const sorted = useMemo(() => [...loans]
    .filter((loan) => {
      const book = books.find((item) => item.id === loan.bookId);
      const member = MEMBERS.find((item) => item.id === loan.memberId);
      const haystack = `${book?.title ?? ""} ${member?.name ?? ""} ${loan.id}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) &&
        (filter === "all" || (filter === "late" ? loan.dueIn < 0 : loan.dueIn >= 0 && loan.dueIn <= 3));
    })
    .sort((a, b) => a.dueIn - b.dueIn), [books, filter, loans, query]);
  const lateCount = loans.filter((loan) => loan.dueIn < 0).length;
  const soonCount = loans.filter((loan) => loan.dueIn >= 0 && loan.dueIn <= 3).length;
  const availableCopies = books.reduce((total, book) => total + book.stock, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-7 sm:px-6 sm:pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-indigo-300">Pilotage simplifié</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Centre de pilotage</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
        <Glass className="flex max-w-full items-center gap-3 px-4 py-2.5" glow="rgba(52,211,153,.35)">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-white/70 sm:text-sm">
            Relances automatiques actives · prochain envoi 08:00
          </span>
        </Glass>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4 lg:row-span-2">
          <ScanHub loans={loans} onFound={setInspect} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-8">
          <Glass className="p-4 sm:p-5" glow="rgba(129,140,248,.35)">
            <p className="text-xs uppercase tracking-wide text-white/45">Prêts actifs</p>
            <p className="mt-2 font-display text-4xl text-indigo-200">{loans.length}</p>
            <p className="text-sm text-white/45">suivis maintenant</p>
          </Glass>
          <Glass className="p-4 sm:p-5" glow="rgba(52,211,153,.35)">
            <p className="text-xs uppercase tracking-wide text-white/45">Stock disponible</p>
            <p className="mt-2 font-display text-4xl text-emerald-300">{availableCopies}</p>
            <p className="text-sm text-white/45">exemplaires</p>
          </Glass>
          {counts.map(({ k, n }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Glass className="p-4 sm:p-5" glow={RADAR[k].c + "55"}>
                <div className="mb-4 flex items-center justify-between">
                  <Radar size={18} style={{ color: RADAR[k].c }} />
                  <GlowBadge level={k} />
                </div>
                <p
                  className="font-display text-5xl"
                  style={{ color: RADAR[k].c, textShadow: `0 0 28px ${RADAR[k].c}88` }}
                >
                  {n}
                </p>
                <p className="text-sm text-white/45">
                  prêt{n > 1 ? "s" : ""} concerné{n > 1 ? "s" : ""}
                </p>
              </Glass>
            </motion.div>
          ))}
        </div>

        <Glass className="p-2 sm:p-3 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-3">
            <h3 className="mr-auto font-display text-xl">Radar des retards</h3>
            <label className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/55 sm:w-auto">
              <Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher…" aria-label="Rechercher un prêt" className="w-full bg-transparent outline-none placeholder:text-white/25 sm:w-40" />
            </label>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filtrer les prêts" className="w-full rounded-full border border-white/10 bg-[#121827] px-3 py-2 text-xs text-white/70 sm:w-auto">
              <option value="all">Tous ({loans.length})</option>
              <option value="late">En retard ({lateCount})</option>
              <option value="soon">Échéance proche ({soonCount})</option>
            </select>
          </div>
          <ul>
            {sorted.map((l, i) => {
              const b = books.find((x) => x.id === l.bookId);
              const m = MEMBERS.find((x) => x.id === l.memberId);
              if (!b || !m) return null;
              const lv = radar(l.dueIn);
              return (
                <motion.li
                  key={l.id}
                  layout
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid gap-3 rounded-2xl px-3 py-3 hover:bg-white/[0.04] sm:flex sm:flex-wrap sm:items-center"
                >
                  <span
                    className="h-10 w-1 rounded-full"
                    style={{
                      background: RADAR[lv].c,
                      boxShadow: lv === "red" ? `0 0 12px ${RADAR[lv].c}` : "none",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-white/45">
                      {m.name} · {m.id}
                    </p>
                  </div>
                  <div className="w-auto text-left sm:w-32 sm:text-right">
                    <GlowBadge level={lv} text={dueText(l.dueIn)} />
                  </div>
                  <div className="grid gap-1.5 min-[420px]:grid-cols-3 sm:flex">
                    <Magnetic
                      onClick={() => setInspect(l)}
                      aria-label={`Inspecter le prêt ${l.id}`}
                      className="w-full bg-white/8 px-2 py-2 text-xs text-white/80 hover:bg-white/15 sm:w-auto sm:px-3 sm:py-1.5"
                    >
                      <User size={13} />
                      Inspecter
                    </Magnetic>
                    <Magnetic
                      onClick={() => notify(l)}
                      disabled={sending === l.id || (l.notified && lv === "ok")}
                      aria-label={l.notified ? "Relance déjà envoyée" : `Notifier ${m.name}`}
                      className={`w-full px-2 py-2 text-xs sm:w-auto ${
                        l.notified
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-indigo-400/15 text-indigo-200 hover:bg-indigo-400/25"
                      }`}
                    >
                      {sending === l.id ? (
                        <>
                          <motion.span
                            animate={{ x: [0, 12, -6, 0], opacity: [1, 0, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.9 }}
                          >
                            <Send size={13} />
                          </motion.span>
                          Envoi…
                        </>
                      ) : l.notified ? (
                        <>
                          <Check size={13} />
                          Notifié
                        </>
                      ) : (
                        <>
                          <Bell size={13} />
                          Notifier
                        </>
                      )}
                    </Magnetic>
                    <Magnetic
                      onClick={() => setRet(l)}
                      aria-label={`Enregistrer le retour de ${b.title}`}
                     className="w-full bg-emerald-400/15 px-2 py-2 text-xs text-emerald-300 hover:bg-emerald-400/25 sm:w-auto sm:px-3 sm:py-1.5"
                    >
                      <PackageCheck size={13} />
                      Restituer
                    </Magnetic>
                  </div>
                </motion.li>
              );
            })}
            {!sorted.length && (
              <li className="py-10 text-center text-sm text-white/40">
                Aucun prêt ne correspond à ces critères.
              </li>
            )}
          </ul>
        </Glass>

        <Glass className="p-5 sm:p-6 lg:col-span-4">
          <h3 className="mb-4 font-display text-xl">Stock en direct</h3>
          <ul className="space-y-3">
            {books.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-3 text-white/70">{b.title}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={b.stock}
                    initial={{ y: -12, opacity: 0, scale: 1.4 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className={`font-display text-lg ${
                      b.stock ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {b.stock}/{b.total}
                  </motion.span>
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </Glass>
        <Glass className="p-5 sm:p-6 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2">
            <History size={17} className="text-indigo-300" />
            <h3 className="font-display text-xl">Historique des retours</h3>
          </div>
          {returnHistory.length ? (
            <ul className="space-y-3">
              {returnHistory.slice(0, 5).map((item) => {
                const book = books.find((entry) => entry.id === item.bookId);
                return <li key={item.id} className="border-t border-white/10 pt-3 text-sm"><p>{book?.title ?? item.bookId}</p><p className="mt-1 text-xs text-white/45">{item.condition} · {item.returnedOn}</p></li>;
              })}
            </ul>
          ) : <p className="text-sm text-white/40">Aucun retour enregistré.</p>}
        </Glass>
      </div>

      <Inspector loan={inspect} books={books} onClose={() => setInspect(null)} />
      <ReturnStation loan={ret} book={ret ? books.find((book) => book.id === ret.bookId) ?? null : null} onClose={() => setRet(null)} onDone={doReturn} />
    </div>
  );
}
