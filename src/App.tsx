import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, SunMoon, BookOpen, LogOut, Lock } from "lucide-react";
import { BOOKS, INITIAL_LOANS, MEMBER_RESERVATIONS } from "./data/mockData";
import { Login } from "./components/auth/Login";
import { MemberView } from "./components/member/MemberView";
import { Spotlight } from "./components/member/Spotlight";
import { ManagerView } from "./components/manager/ManagerView";
import { Book, Loan, Reservation, ReturnRecord } from "./types/library";
import {
  AuthMode,
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

const loadInitialBooks = (): Book[] => {
  const stored = readStorage<Book[] | null>(STORAGE_KEYS.books, null);
  if (!stored || stored.length < 40) {
    return BOOKS;
  }
  return validBooks(stored);
};

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
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const storedMode =
      readStorage<AuthMode | null>(STORAGE_KEYS.authMode, null) ||
      readSession<AuthMode | null>(STORAGE_KEYS.authMode, null);
    return storedMode === "demo" ? "demo" : "email";
  });
  const [auth, setAuth] = useState(() =>
    Boolean(readStorage(STORAGE_KEYS.authEmail, "") || readSession(STORAGE_KEYS.authEmail, ""))
  );
  const [books, setBooks] = useState<Book[]>(loadInitialBooks);
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

  // Synchronisation dynamique cross-tab / LocalStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.books && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length >= 40) {
            setBooks(validBooks(parsed));
          }
        } catch {
          // ignore parsing error
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  const saveAuth = (
    email: string,
    nextRole: UserRole,
    remember: boolean,
    mode: AuthMode = "email"
  ) => {
    localStorage.removeItem(STORAGE_KEYS.authEmail);
    localStorage.removeItem(STORAGE_KEYS.authRole);
    localStorage.removeItem(STORAGE_KEYS.authMode);
    sessionStorage.removeItem(STORAGE_KEYS.authEmail);
    sessionStorage.removeItem(STORAGE_KEYS.authRole);
    sessionStorage.removeItem(STORAGE_KEYS.authMode);

    const writer = remember ? writeStorage : writeSession;
    writer(STORAGE_KEYS.authEmail, email);
    writer(STORAGE_KEYS.authRole, nextRole);
    writer(STORAGE_KEYS.authMode, mode);
    writeStorage(STORAGE_KEYS.rememberSession, remember);

    setUserEmail(email);
    setRole(nextRole);
    setAuthMode(mode);
    setAuth(true);
  };

  const switchDemoRole = (nextRole: UserRole) => {
    if (authMode !== "demo") return;
    const demoEmail =
      nextRole === "manager" ? "k.alaoui@usmba.ac.ma" : "s.elidrissi@usmba.ac.ma";
    setRole(nextRole);
    setUserEmail(demoEmail);
    const writer = readStorage(STORAGE_KEYS.rememberSession, false) ? writeStorage : writeSession;
    writer(STORAGE_KEYS.authRole, nextRole);
    writer(STORAGE_KEYS.authEmail, demoEmail);
  };

  const handleLogout = () => {
    setAuth(false);
    setRole(null);
    setUserEmail("");
    setAuthMode("email");
    localStorage.removeItem(STORAGE_KEYS.authEmail);
    localStorage.removeItem(STORAGE_KEYS.authRole);
    localStorage.removeItem(STORAGE_KEYS.authMode);
    localStorage.removeItem(STORAGE_KEYS.rememberSession);
    sessionStorage.removeItem(STORAGE_KEYS.authEmail);
    sessionStorage.removeItem(STORAGE_KEYS.authRole);
    sessionStorage.removeItem(STORAGE_KEYS.authMode);
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

      {/* Background ambient orbs */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-indigo-600/25 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute -bottom-52 -right-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/15 blur-[140px]"
        />
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl ${
          lightMode ? "bg-white/85" : "bg-[#0A0D14]/80"
        }`}
      >
        <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-300">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl block leading-none">L'Atelier des Savoirs</span>
              <span className="text-[11px] text-white/45">Bibliothèque universitaire · 50 ouvrages</span>
            </div>
          </div>

          {auth ? (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {/* CONDITION: Switcher ONLY available in DEMO MODE */}
              {authMode === "demo" ? (
                <div className="flex items-center rounded-2xl bg-black/60 p-1 border border-amber-400/40 shadow-inner">
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 px-2">
                    <Sparkles size={12} /> Mode Démo :
                  </span>
                  <button
                    type="button"
                    onClick={() => switchDemoRole("consultant")}
                    aria-pressed={!isManager}
                    title="Mode Démo : Basculer vers l'Espace Client (Salma El Idrissi)"
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      !isManager
                        ? "bg-emerald-500 text-black shadow-[0_0_20px_-3px_rgba(52,211,153,.7)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <BookOpen size={13} strokeWidth={2.2} />
                    <span>Espace Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole("manager")}
                    aria-pressed={isManager}
                    title="Mode Démo : Basculer vers l'Espace Gérant (Pr. Karim Alaoui)"
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isManager
                        ? "bg-indigo-500 text-white shadow-[0_0_20px_-3px_rgba(139,92,246,.7)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ShieldCheck size={13} strokeWidth={2.2} />
                    <span>Espace Gérant</span>
                  </button>
                </div>
              ) : (
                /* CONNEXION EMAIL ACADÉMIQUE : Panneau unique et fixe, aucun basculement autorisé */
                <div
                  className={`flex items-center gap-2 rounded-2xl px-3.5 py-1.5 border text-xs ${
                    isManager
                      ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-200"
                      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  }`}
                  title="Session verrouillée à votre rôle universitaire"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isManager ? "bg-indigo-400" : "bg-emerald-400"
                    }`}
                  />
                  <span className="font-semibold">
                    {isManager ? "Espace Gestionnaire" : "Espace Client"}
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="font-mono text-[11px] text-white/70 max-w-[170px] truncate sm:max-w-none">
                    {userEmail}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50 border border-white/10">
                    <Lock size={10} /> Fixe
                  </span>
                </div>
              )}

              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => setLightMode((value) => !value)}
                aria-label={lightMode ? "Activer le thème sombre" : "Activer le thème clair"}
                className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white transition"
              >
                <SunMoon size={16} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                aria-label={`Se déconnecter de ${userEmail || "votre session"}`}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-rose-500/15 hover:border-rose-400/30 hover:text-rose-200 transition"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <ShieldCheck size={14} className="text-emerald-400" />
              Accès doubles espaces sécurisé
            </span>
          )}
        </div>
      </header>

      {/* Main Content with strict interface isolation */}
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
              /* STRICT CLIENT INTERFACE: Only catalog, book details, filters, and student tracking */
              <MemberView
                books={books}
                openSpot={() => setSpot(true)}
                query={query}
                setQuery={setQuery}
              />
            ) : (
              /* STRICT MANAGER INTERFACE: Only live stock charts, barcode scanner, desk express & loan radar */
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

      {/* Spotlight (Search Dialog - Only available for Client search) */}
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
