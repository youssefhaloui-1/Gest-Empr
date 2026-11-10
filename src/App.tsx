import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, ShieldCheck, SunMoon } from "lucide-react";
import { BOOKS, INITIAL_LOANS, MEMBER_RESERVATIONS } from "./data/mockData";
import { Login } from "./components/auth/Login";
import { MemberView } from "./components/member/MemberView";
import { Spotlight } from "./components/member/Spotlight";
import { ManagerView } from "./components/manager/ManagerView";
import { Book, Loan, Reservation, ReturnRecord } from "./types/library";
import {
  clearLibraryData,
  readSession,
  readStorage,
  STORAGE_KEYS,
  UserRole,
  writeSession,
  writeStorage,
} from "./utils/storage";

const validBooks = (value: Book[]): Book[] =>
  value.map((book) => ({
    ...book,
    stock: Math.max(0, Math.min(book.total, Number(book.stock) || 0)),
  }));

export default function App() {
  const [userEmail, setUserEmail] = useState(() =>
    readStorage(STORAGE_KEYS.authEmail, "") || readSession(STORAGE_KEYS.authEmail, "")
  );
  const [role, setRole] = useState<UserRole | null>(() => {
    const storedRole =
      readStorage<UserRole | null>(STORAGE_KEYS.authRole, null) ||
      readSession<UserRole | null>(STORAGE_KEYS.authRole, null);
    return storedRole === "manager" || storedRole === "consultant" ? storedRole : null;
  });
  const [auth, setAuth] = useState(() =>
    Boolean(readStorage(STORAGE_KEYS.authEmail, "") || readSession(STORAGE_KEYS.authEmail, ""))
  );
  const [books, setBooks] = useState<Book[]>(() =>
    validBooks(readStorage(STORAGE_KEYS.books, BOOKS))
  );
  const [loans, setLoans] = useState<Loan[]>(() =>
    readStorage(STORAGE_KEYS.loans, INITIAL_LOANS)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    readStorage(STORAGE_KEYS.reservations, MEMBER_RESERVATIONS)
  );
  const [returnHistory, setReturnHistory] = useState<ReturnRecord[]>(() =>
    readStorage(STORAGE_KEYS.returnHistory, [])
  );
  const [spot, setSpot] = useState(false);
  const [query, setQuery] = useState("");
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.books, books);
  }, [books]);
  useEffect(() => writeStorage(STORAGE_KEYS.loans, loans), [loans]);
  useEffect(() => writeStorage(STORAGE_KEYS.reservations, reservations), [reservations]);
  useEffect(() => writeStorage(STORAGE_KEYS.returnHistory, returnHistory), [returnHistory]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpot((s) => !s);
      }
      if (e.key === "Escape") setSpot(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const view = role === "manager" ? "manager" : "member";
  const isManager = role === "manager";
  const resetDemo = () => {
    clearLibraryData();
    setBooks(BOOKS);
    setLoans(INITIAL_LOANS);
    setReservations(MEMBER_RESERVATIONS);
    setReturnHistory([]);
    setAuth(false);
    setRole(null);
    setUserEmail("");
    setSpot(false);
    setQuery("");
  };
  const saveAuth = (email: string, nextRole: UserRole, remember: boolean) => {
    localStorage.removeItem(STORAGE_KEYS.authEmail);
    localStorage.removeItem(STORAGE_KEYS.authRole);
    sessionStorage.removeItem(STORAGE_KEYS.authEmail);
    sessionStorage.removeItem(STORAGE_KEYS.authRole);
    const writer = remember ? writeStorage : writeSession;
    writer(STORAGE_KEYS.authEmail, email);
    writer(STORAGE_KEYS.authRole, nextRole);
    writeStorage(STORAGE_KEYS.rememberSession, remember);
    setUserEmail(email);
    setRole(nextRole);
    setAuth(true);
  };

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden text-white ${lightMode ? "theme-light" : ""}`}
      style={{
        background: lightMode ? "#f5f7fb" : "#0A0D14",
        fontFamily: "'Instrument Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        .font-display{font-family:'Fraunces',Georgia,serif;font-weight:500;letter-spacing:-.02em}
        .animate-ping-slow{animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite}
        @media(prefers-reduced-motion:reduce){*{animation:none!important}}
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-indigo-600/25 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute -bottom-52 -right-40 h-[32rem] w-[32rem] rounded-full bg-fuchsia-600/15 blur-[140px]"
        />
      </div>

      <header className={`sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl ${lightMode ? "bg-white/75" : "bg-[#0A0D14]/60"}`}>
        <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-indigo-300" />
            <span className="font-display text-lg sm:text-xl">L'Atelier des Savoirs</span>
          </div>
          {auth ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3">
              <span className="hidden text-xs text-white/45 sm:inline">
                {isManager ? "Gérant" : "Consultant"}
              </span>
              <button
                type="button"
                onClick={() => setLightMode((value) => !value)}
                aria-label={lightMode ? "Activer le thème sombre" : "Activer le thème clair"}
                className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
              >
                <SunMoon size={16} />
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <RotateCcw size={13} /> Réinitialiser
              </button>
              <button
                onClick={() => {
                  setAuth(false);
                  setRole(null);
                  setUserEmail("");
                  localStorage.removeItem(STORAGE_KEYS.authEmail);
                  localStorage.removeItem(STORAGE_KEYS.authRole);
                  localStorage.removeItem(STORAGE_KEYS.rememberSession);
                  sessionStorage.removeItem(STORAGE_KEYS.authEmail);
                  sessionStorage.removeItem(STORAGE_KEYS.authRole);
                }}
                aria-label={`Se déconnecter de ${userEmail || "votre session"}`}
                className="min-h-10 px-2 text-xs text-white/60 hover:text-white sm:px-0 sm:text-sm"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <ShieldCheck size={14} />
              Accès sécurisé
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={auth ? view : "login"}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
          >
            {!auth ? (
              <Login onEnter={saveAuth} />
            ) : !isManager ? (
              <MemberView
                books={books}
                setBooks={setBooks}
                reservations={reservations}
                setReservations={setReservations}
                openSpot={() => setSpot(true)}
                query={query}
                setQuery={setQuery}
              />
            ) : (
              <ManagerView
                books={books}
                setBooks={setBooks}
                loans={loans}
                setLoans={setLoans}
                returnHistory={returnHistory}
                setReturnHistory={setReturnHistory}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Spotlight
        open={spot && auth && !isManager}
        onClose={() => setSpot(false)}
        books={books}
        onPick={(t) => {
          setQuery(t);
        }}
      />
    </div>
  );
}
