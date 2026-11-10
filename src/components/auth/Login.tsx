import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Mail, Check, AlertTriangle, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { DOMAINS } from "../../data/mockData";
import { Glass, Magnetic, PRIMARY } from "../ui/primitives";
import { readStorage, STORAGE_KEYS, UserRole } from "../../utils/storage";

export function Login({ onEnter }: { onEnter: (email: string, role: UserRole, remember: boolean) => void }) {
  const [email, setEmail] = useState(() => readStorage(STORAGE_KEYS.authEmail, ""));
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("consultant");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remember, setRemember] = useState(() => readStorage(STORAGE_KEYS.rememberSession, true));
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const state: "idle" | "ok" | "bad" =
    !email
      ? "idle"
      : emailValid && DOMAINS.includes(domain)
      ? "ok"
      : "bad";
  const passwordValid = password.length >= 6;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (state !== "ok" || !passwordValid) {
      setError("Vérifiez votre adresse institutionnelle et saisissez un mot de passe d'au moins 6 caractères.");
      return;
    }
    setSuccess(true);
    window.setTimeout(() => onEnter(email, role, remember), 350);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-72px)] place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <Glass className="p-5 sm:p-8" glow="rgba(139,92,246,.5)">
          <motion.div
            className="mb-5 flex items-center gap-3 sm:mb-6"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600">
              <Library size={22} />
            </div>
            <div>
              <h1 className="font-display text-3xl leading-none">L'Atelier des Savoirs</h1>
              <p className="mt-1 text-sm text-white/50">Bibliothèque universitaire</p>
            </div>
          </motion.div>

          <form onSubmit={submit} noValidate className="space-y-3">
          <fieldset>
            <legend className="mb-1.5 block text-sm text-white/75">Type d'accès</legend>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1 ring-1 ring-white/10">
              {([
                ["consultant", "Consultant"],
                ["manager", "Gérant"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={role === value}
                  onClick={() => setRole(value)}
                  className={`min-h-10 rounded-xl px-3 text-sm transition ${
                    role === value
                      ? "bg-indigo-500/80 text-white shadow-[0_0_20px_-8px_rgba(129,140,248,.9)]"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-white/75">Email institutionnel</label>
          <motion.div
            animate={{
              boxShadow:
                state === "ok"
                  ? "0 0 0 1px #34D399, 0 0 28px -6px #34D399"
                  : state === "bad"
                  ? "0 0 0 1px #FF2D55, 0 0 28px -8px #FF2D55"
                  : "0 0 0 1px rgba(255,255,255,.12)",
            }}
            className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3.5"
          >
            <Mail size={18} className="text-white/40" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={submitted && state !== "ok"}
              aria-describedby="email-hint"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@usmba.ac.ma"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
            />
            <AnimatePresence mode="wait">
              {state === "ok" && (
                <motion.span
                  key="ok"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-black"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
              )}
              {state === "bad" && (
                <motion.span
                  key="bad"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, x: [0, -4, 4, -3, 0] }}
                  exit={{ scale: 0 }}
                  className="text-rose-400"
                >
                  <AlertTriangle size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div id="email-hint" className="min-h-4 pt-1 text-xs" aria-live="polite">
            {state === "ok" && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-300">
                Établissement reconnu : {domain}
              </motion.p>
            )}
            {state === "bad" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-300">
                Ce domaine n'appartient à aucune université partenaire.
              </motion.p>
            )}
          </div>
          </div>

          <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/75">Mot de passe</label>
          <div className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3.5 ring-1 ring-white/10 focus-within:ring-indigo-300/60">
            <LockKeyhole size={18} className="text-white/40" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={submitted && !passwordValid}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {submitted && !passwordValid && <p className="pt-1 text-xs text-rose-300">Le mot de passe doit contenir au moins 6 caractères.</p>}
          </div>

          {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
          {success && (
            <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              <ShieldCheck size={14} /> Connexion réussie. Ouverture de votre espace…
            </p>
          )}

          <label className="flex items-center gap-2 text-xs text-white/55">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-indigo-400"
            />
            Se souvenir de moi sur cet appareil
          </label>

          <Magnetic type="submit" disabled={state !== "ok" || !passwordValid || success} className={`${PRIMARY} min-h-11 w-full`}>
            Accéder à la bibliothèque
          </Magnetic>
          </form>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => onEnter("demo.consultant@usmba.ac.ma", "consultant", remember)}
              className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              Démo consultant
            </button>
            <button
              onClick={() => onEnter("demo.gerant@usmba.ac.ma", "manager", remember)}
              className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              Démo gérant
            </button>
          </div>
        </Glass>
      </motion.div>
    </div>
  );
}
