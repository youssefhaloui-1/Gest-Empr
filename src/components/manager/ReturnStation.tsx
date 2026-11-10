import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageCheck, Check } from "lucide-react";
import { Book, Loan, Cond } from "../../types/library";
import { Glass, Magnetic, PRIMARY, GHOST } from "../ui/primitives";

export function ReturnStation({
  loan,
  book,
  onClose,
  onDone,
}: {
  loan: Loan | null;
  book: Book | null;
  onClose: () => void;
  onDone: (c: Cond) => void;
}) {
  const [c, setC] = useState<Cond | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setC(null);
    setDone(false);
  }, [loan]);
  useEffect(() => {
    if (!loan) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [loan, onClose]);

  const opts: { k: Cond; col: string; d: string }[] = [
    { k: "Neuf", col: "#34D399", d: "Aucune trace" },
    { k: "Usure normale", col: "#FBBF24", d: "Coins, légères marques" },
    { k: "Endommagé", col: "#FF2D55", d: "Pages, couverture" },
  ];

  return (
    <AnimatePresence>
      {loan && book && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Glass className="bg-[#0f1320]/90 p-4 sm:p-7" glow="rgba(52,211,153,.4)">
              {!done ? (
                <>
                  <h3 className="font-display text-2xl">Contrôle de conformité</h3>
                  <p className="mb-5 mt-1 text-sm text-white/50">
                    {book.title} · {loan.id}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {opts.map((o) => (
                      <motion.button
                        key={o.k}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setC(o.k)}
                        className="rounded-2xl border p-4 text-left transition"
                        style={{
                          borderColor: c === o.k ? o.col : "rgba(255,255,255,.1)",
                          background: c === o.k ? o.col + "1f" : "rgba(255,255,255,.03)",
                          boxShadow: c === o.k ? `0 0 26px -6px ${o.col}` : "none",
                        }}
                      >
                        <span
                          className="mb-3 block h-2.5 w-2.5 rounded-full"
                          style={{ background: o.col, boxShadow: `0 0 10px ${o.col}` }}
                        />
                        <span className="block text-sm font-medium">{o.k}</span>
                        <span className="text-[11px] text-white/40">{o.d}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Magnetic onClick={onClose} className={GHOST}>
                      Annuler
                    </Magnetic>
                    <Magnetic
                      disabled={!c}
                      onClick={() => {
                        onDone(c!);
                        setDone(true);
                        setTimeout(onClose, 1700);
                      }}
                      className={PRIMARY}
                    >
                      <PackageCheck size={16} />
                      Valider le retour
                    </Magnetic>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1] }}
                    className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-black shadow-[0_0_50px_rgba(52,211,153,.7)]"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  <p className="font-display text-xl">Retour enregistré</p>
                  <p className="mt-1 text-sm text-white/50">
                    Stock mis à jour :{" "}
                    {c === "Endommagé"
                      ? "exemplaire mis en réparation"
                      : "+1 exemplaire disponible"}
                    .
                  </p>
                </div>
              )}
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
