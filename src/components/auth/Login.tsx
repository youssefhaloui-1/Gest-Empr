import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Mail,
  Check,
  AlertTriangle,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen,
  KeyRound,
  Info,
  ScanLine,
  BarChart3,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Glass, Magnetic, PRIMARY } from "../ui/primitives";
import { AuthMode, UserRole } from "../../utils/storage";

const isValidUsmbaEmail = (email: string): boolean => {
  return /^[^\s@]+@usmba\.ac\.ma$/i.test(email.trim());
};

export function Login({
  onEnter,
}: {
  onEnter: (email: string, role: UserRole, remember: boolean, authMode: AuthMode) => void;
}) {
  const [activePortal, setActivePortal] = useState<UserRole>("consultant");

  // Client form state - MUST BE EMPTY BY DEFAULT
  const [clientEmail, setClientEmail] = useState("");
  const [clientRemember, setClientRemember] = useState(false);

  // Manager form state - MUST BE EMPTY BY DEFAULT
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [managerPin, setManagerPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [managerRemember, setManagerRemember] = useState(false);

  // Status feedback
  const [clientSubmitted, setClientSubmitted] = useState(false);
  const [managerSubmitted, setManagerSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Real-time validations
  const clientEmailValid = isValidUsmbaEmail(clientEmail);
  const managerEmailValid = isValidUsmbaEmail(managerEmail);
  const managerPasswordValid = managerPassword.length >= 6;
  const managerPinValid = /^\d{4}$/.test(managerPin.trim());

  const handleClientSubmit = (e: FormEvent) => {
    e.preventDefault();
    setClientSubmitted(true);
    setError("");

    if (!clientEmail.trim()) {
      setError("Veuillez saisir votre adresse email académique.");
      return;
    }
    if (!clientEmailValid) {
      setError("Adresse invalide : L'extension académique obligatoire @usmba.ac.ma est requise (ex: etudiant@usmba.ac.ma).");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      onEnter(clientEmail.trim().toLowerCase(), "consultant", clientRemember, "email");
    }, 350);
  };

  const handleManagerSubmit = (e: FormEvent) => {
    e.preventDefault();
    setManagerSubmitted(true);
    setError("");

    if (!managerEmail.trim()) {
      setError("Veuillez renseigner votre email de gestion.");
      return;
    }
    if (!managerEmailValid) {
      setError("Adresse invalide : L'email de gestion doit obligatoirement comporter le domaine académique @usmba.ac.ma.");
      return;
    }
    if (!managerPasswordValid) {
      setError("Le mot de passe de gestion doit comporter au moins 6 caractères.");
      return;
    }
    if (!managerPinValid) {
      setError("Le code de sécurité Guichet doit être un code PIN à 4 chiffres (ex: 2026).");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      onEnter(managerEmail.trim().toLowerCase(), "manager", managerRemember, "email");
    }, 350);
  };

  // Quick Demo Access triggers demo mode (enables switcher in header)
  const enterDemoClient = () => {
    setError("");
    setSuccess(true);
    window.setTimeout(() => {
      onEnter("s.elidrissi@usmba.ac.ma", "consultant", false, "demo");
    }, 250);
  };

  const enterDemoManager = () => {
    setError("");
    setSuccess(true);
    window.setTimeout(() => {
      onEnter("k.alaoui@usmba.ac.ma", "manager", false, "demo");
    }, 250);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-72px)] place-items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-xl"
      >
        <Glass className="p-5 sm:p-8" glow={activePortal === "consultant" ? "rgba(52,211,153,.35)" : "rgba(139,92,246,.45)"}>
          {/* Logo & Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl transition-all duration-300 ${
                  activePortal === "consultant"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_24px_rgba(52,211,153,.4)]"
                    : "bg-gradient-to-br from-indigo-400 to-violet-600 shadow-[0_0_24px_rgba(139,92,246,.4)]"
                }`}
              >
                <Library size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl leading-none">L'Atelier des Savoirs</h1>
                <p className="mt-1 text-xs sm:text-sm text-white/50">Bibliothèque universitaire USMBA · Accès sécurisé</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium border ${
                activePortal === "consultant"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
              }`}
            >
              Domaine : @usmba.ac.ma
            </span>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-white/50 font-medium">
              Espace de connexion :
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/40 p-1.5 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => {
                  setActivePortal("consultant");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-medium transition-all ${
                  activePortal === "consultant"
                    ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 shadow-[0_0_20px_-4px_rgba(52,211,153,.5)]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <BookOpen size={16} />
                <span>Espace Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal("manager");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-medium transition-all ${
                  activePortal === "manager"
                    ? "bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 shadow-[0_0_20px_-4px_rgba(139,92,246,.5)]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Espace Gestionnaire</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activePortal === "consultant" ? (
              /* ================= CLIENT / LECTEUR PORTAL ================= */
              <motion.div
                key="client-portal"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-200">
                  <div className="flex items-start gap-2.5">
                    <Info size={16} className="shrink-0 text-emerald-300 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-100">Consultation du catalogue & disponibilité</p>
                      <p className="mt-1 text-emerald-200/80">
                        Consultez librement les 50 ouvrages et vérifiez leur disponibilité en rayon en temps réel.
                        <strong className="block mt-1 text-emerald-100 font-medium">
                          Réservation en ligne désactivée : les prêts s'effectuent sur place au guichet de la bibliothèque.
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleClientSubmit} noValidate className="space-y-3.5">
                  <div>
                    <label htmlFor="client-email" className="mb-1.5 flex items-center justify-between text-xs sm:text-sm text-white/80 font-medium">
                      <span>Email académique obligatoire</span>
                      <span className="text-[11px] font-mono text-emerald-400">@usmba.ac.ma</span>
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl bg-black/40 px-4 py-3.5 ring-1 ring-white/10 focus-within:ring-emerald-400/60 transition">
                      <Mail size={18} className="text-white/40 shrink-0" />
                      <input
                        id="client-email"
                        type="email"
                        autoComplete="email"
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="exemple: s.elidrissi@usmba.ac.ma"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                      />
                      {clientEmailValid && (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-black shrink-0" title="Email académique valide">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    {clientSubmitted && !clientEmailValid && (
                      <p className="pt-1.5 text-xs text-rose-300 flex items-center gap-1">
                        <AlertTriangle size={13} /> L'adresse email doit obligatoirement se terminer par @usmba.ac.ma
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={clientRemember}
                      onChange={(e) => setClientRemember(e.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-500"
                    />
                    Mémoriser ma session de consultation
                  </label>

                  {error && (
                    <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                      {error}
                    </p>
                  )}

                  {success && (
                    <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                      <Check size={14} /> Accès accordé. Chargement du catalogue des 50 ouvrages…
                    </p>
                  )}

                  <Magnetic
                    type="submit"
                    disabled={success}
                    className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-medium text-black shadow-[0_0_25px_-5px_rgba(52,211,153,.5)] hover:brightness-110 transition disabled:opacity-50"
                  >
                    Se connecter avec mon Email Académique
                  </Magnetic>
                </form>

                {/* DEMO MODE SECTION */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-400" /> Mode Démo (Alternance Client / Gérant)
                    </span>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      Switch disponible
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={enterDemoClient}
                    className="w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2.5 text-center text-xs text-emerald-200 hover:bg-emerald-500/20 transition flex items-center justify-center gap-2"
                  >
                    <span>⚡ Accéder en Mode Démo · Lecteur (Salma El Idrissi)</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ================= MANAGER / BIBLIOTHÉCAIRE PORTAL ================= */
              <motion.div
                key="manager-portal"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4 text-xs leading-relaxed text-indigo-200">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={18} className="shrink-0 text-indigo-300 mt-0.5" />
                    <div>
                      <p className="font-semibold text-indigo-100">Espace réservé au personnel de bibliothèque</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-indigo-200/80">
                        <span className="inline-flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                          <BarChart3 size={11} /> Tableaux & Diagrammes de stock
                        </span>
                        <span className="inline-flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                          <ScanLine size={11} /> Scanner USB & Caméra
                        </span>
                        <span className="inline-flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-md">
                          <UserCheck size={11} /> Guichet d'emprunt sur place
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleManagerSubmit} noValidate className="space-y-3.5">
                  <div>
                    <label htmlFor="manager-email" className="mb-1.5 flex items-center justify-between text-xs sm:text-sm text-white/80 font-medium">
                      <span>Email académique de gestion</span>
                      <span className="text-[11px] font-mono text-indigo-400">@usmba.ac.ma</span>
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl bg-black/40 px-4 py-3 ring-1 ring-white/10 focus-within:ring-indigo-400/60 transition">
                      <Mail size={18} className="text-white/40 shrink-0" />
                      <input
                        id="manager-email"
                        type="email"
                        autoComplete="email"
                        value={managerEmail}
                        onChange={(e) => {
                          setManagerEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="exemple: k.alaoui@usmba.ac.ma"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                      />
                      {managerEmailValid && (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-400 text-black shrink-0" title="Email académique valide">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    {managerSubmitted && !managerEmailValid && (
                      <p className="pt-1.5 text-xs text-rose-300 flex items-center gap-1">
                        <AlertTriangle size={13} /> L'adresse email de gestion doit comporter l'extension @usmba.ac.ma
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="manager-pwd" className="mb-1.5 block text-xs text-white/80 font-medium">
                        Mot de passe administrateur
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-3.5 py-3 ring-1 ring-white/10 focus-within:ring-indigo-400/60 transition">
                        <LockKeyhole size={16} className="text-white/40 shrink-0" />
                        <input
                          id="manager-pwd"
                          type={showPassword ? "text" : "password"}
                          value={managerPassword}
                          onChange={(e) => {
                            setManagerPassword(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="Min. 6 caractères"
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-white/45 hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="manager-pin" className="mb-1.5 block text-xs text-white/80 font-medium">
                        Code Guichet (Double Auth)
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-3.5 py-3 ring-1 ring-white/10 focus-within:ring-indigo-400/60 transition">
                        <KeyRound size={16} className="text-white/40 shrink-0" />
                        <input
                          id="manager-pin"
                          type="password"
                          maxLength={4}
                          value={managerPin}
                          onChange={(e) => {
                            setManagerPin(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="PIN 4 chiffres"
                          className="w-full bg-transparent text-sm tracking-widest font-mono outline-none placeholder:text-white/25"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={managerRemember}
                      onChange={(e) => setManagerRemember(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-500"
                    />
                    Garder ma session de gestion ouverte
                  </label>

                  {error && (
                    <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                      {error}
                    </p>
                  )}

                  {success && (
                    <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                      <ShieldCheck size={16} /> Authentification gestionnaire validée. Chargement du centre de pilotage…
                    </p>
                  )}

                  <Magnetic
                    type="submit"
                    disabled={success}
                    className={`${PRIMARY} min-h-12 w-full rounded-2xl disabled:opacity-50`}
                  >
                    Se connecter à l'Espace Gestionnaire
                  </Magnetic>
                </form>

                {/* DEMO MODE SECTION */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-400" /> Mode Démo (Alternance Client / Gérant)
                    </span>
                    <span className="text-[10px] text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-400/20">
                      Switch disponible
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={enterDemoManager}
                    className="w-full rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2.5 text-center text-xs text-indigo-200 hover:bg-indigo-500/20 transition flex items-center justify-center gap-2"
                  >
                    <span>⚡ Accéder en Mode Démo · Gérant (Pr. Karim Alaoui)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Glass>
      </motion.div>
    </div>
  );
}

