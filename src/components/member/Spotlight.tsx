import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Book } from "../../types/library";
import { Glass, GlowBadge } from "../ui/primitives";

export function Spotlight({
  open,
  onClose,
  books,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  books: Book[];
  onPick: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const res = books
    .filter((b) =>
      (b.title + b.author + b.field + b.id).toLowerCase().includes(q.toLowerCase())
    )
    .slice(0, 5);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start justify-items-center bg-black/60 pt-[14vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[92%] max-w-xl"
          >
            <Glass className="overflow-hidden bg-[#0f1320]/90" glow="rgba(99,102,241,.6)">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Search size={18} className="text-white/40" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && res[0] && (onPick(res[0].title), onClose())
                  }
                  placeholder="Titre, auteur, discipline ou N° livre…"
                  className="w-full bg-transparent outline-none placeholder:text-white/30"
                />
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                  Échap
                </kbd>
              </div>
              <ul className="p-2">
                {res.map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() => {
                        onPick(b.title);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-white/5"
                    >
                      <span>
                        <span className="block text-sm">{b.title}</span>
                        <span className="text-xs text-white/40">{b.author}</span>
                      </span>
                      <GlowBadge
                        level={b.stock > 0 ? "ok" : "yellow"}
                        text={b.stock > 0 ? "Disponible" : "Réservé"}
                      />
                    </button>
                  </li>
                ))}
                {!res.length && (
                  <li className="px-3 py-6 text-center text-sm text-white/40">
                    Aucun ouvrage ne correspond à « {q} ».
                  </li>
                )}
              </ul>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}