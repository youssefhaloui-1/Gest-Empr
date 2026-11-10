import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone } from "lucide-react";
import { Book, Loan, radar, RADAR, dueText } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge } from "../ui/primitives";

export function Inspector({
  loan,
  books,
  onClose,
}: {
  loan: Loan | null;
  books: Book[];
  onClose: () => void;
}) {
  const b = loan && books.find((x) => x.id === loan.bookId);
  const m = loan && MEMBERS.find((x) => x.id === loan.memberId);

  return (
    <AnimatePresence>
      {loan && b && m && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0c101a]/80 p-6 backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">Fiche de prêt {loan.id}</p>
                <h3 className="font-display text-2xl">Inspection croisée</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Glass className="p-5" glow={`hsla(${b.hue},80%,60%,.5)`}>
                <div
                  className="mb-4 flex h-28 items-end rounded-xl p-3"
                  style={{
                    background: `linear-gradient(145deg, hsl(${b.hue} 70% 38%), hsl(${b.hue + 40} 60% 14%))`,
                  }}
                >
                  <span className="font-display text-lg leading-tight">{b.title}</span>
                </div>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Auteur", b.author],
                    ["N° ouvrage", b.id],
                    ["Discipline", b.field],
                    ["Rayon", b.shelf],
                    ["Stock", `${b.stock}/${b.total}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-white/40">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Glass>

              <Glass className="p-5" glow="rgba(244,114,182,.4)">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-500 font-display text-xl">
                    {m.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium leading-tight">{m.name}</p>
                    <p className="text-xs text-white/45">{m.id}</p>
                  </div>
                </div>
                <p className="mb-3 text-xs text-white/50">{m.role}</p>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/40">Fiabilité</span>
                  <span>{m.reliability}%</span>
                </div>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.reliability}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        m.reliability > 70
                          ? "#34D399"
                          : m.reliability > 50
                          ? "#FBBF24"
                          : "#FF2D55",
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-white/5 p-2">
                    <p className="font-display text-xl">{m.history}</p>
                    <p className="text-[11px] text-white/40">emprunts</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <p className="font-display text-xl">{m.late}</p>
                    <p className="text-[11px] text-white/40">retards</p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-white/60">
                  <Mail size={13} />
                  {m.email}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-xs text-white/60">
                  <Phone size={13} />
                  {m.phone}
                </p>
              </Glass>
            </div>

            <Glass
              className="mt-4 flex items-center justify-between p-5"
              glow={RADAR[radar(loan.dueIn)].c + "66"}
            >
              <div>
                <p className="text-xs text-white/40">Échéance</p>
                <p className="text-lg">{dueText(loan.dueIn)}</p>
              </div>
              <GlowBadge level={radar(loan.dueIn)} />
            </Glass>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}