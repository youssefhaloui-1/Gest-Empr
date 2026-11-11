import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PackageCheck, Check, X } from "lucide-react";
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
  const dialogRef = useRef<HTMLDivElement>(null);

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

  if (!loan || !book || typeof document === "undefined") {
    return null;
  }

  const opts: { k: Cond; col: string; d: string }[] = [
    { k: "Neuf", col: "#34D399", d: "Aucune trace" },
    { k: "Usure normale", col: "#FBBF24", d: "Coins, légères marques" },
    { k: "Endommagé", col: "#FF2D55", d: "Pages, couverture" },
  ];

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: "520px",
            maxHeight: "85vh",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 0 45px -5px rgba(52, 211, 153, 0.35), 0 25px 60px -15px rgba(0, 0, 0, 0.9)",
          }}
          className="relative flex flex-col w-[90%] max-w-[520px] max-h-[85vh] rounded-3xl overflow-hidden bg-[#0d111c] border border-emerald-400/30"
        >
          {/* Header */}
          <div
            style={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}
            className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0f1422]"
          >
            <div className="flex items-center gap-2 text-emerald-300">
              <PackageCheck size={20} />
              <h3 className="font-display text-lg sm:text-xl text-white">Contrôle de restitution</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{ flex: "1 1 auto", overflowY: "auto" }}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
          >
            {!done ? (
              <>
                <div>
                  <p className="font-semibold text-sm text-white">{book.title}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    Prêt : <span className="font-mono text-emerald-300">{loan.id}</span> · Rayon {book.shelf}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-white/70 mb-2 font-medium">État du livre retourné :</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {opts.map((o) => (
                      <button
                        key={o.k}
                        type="button"
                        onClick={() => setC(o.k)}
                        className="rounded-2xl border p-3.5 text-left transition"
                        style={{
                          borderColor: c === o.k ? o.col : "rgba(255,255,255,.1)",
                          background: c === o.k ? o.col + "1f" : "rgba(255,255,255,.03)",
                          boxShadow: c === o.k ? `0 0 20px -4px ${o.col}` : "none",
                        }}
                      >
                        <span
                          className="mb-2.5 block h-2.5 w-2.5 rounded-full"
                          style={{ background: o.col, boxShadow: `0 0 10px ${o.col}` }}
                        />
                        <span className="block text-xs font-semibold text-white">{o.k}</span>
                        <span className="text-[11px] text-white/40">{o.d}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                  <Magnetic onClick={onClose} className={GHOST}>
                    Annuler
                  </Magnetic>
                  <Magnetic
                    disabled={!c}
                    onClick={() => {
                      onDone(c!);
                      setDone(true);
                      setTimeout(onClose, 1400);
                    }}
                    className={PRIMARY}
                  >
                    <PackageCheck size={16} />
                    Valider le retour
                  </Magnetic>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-black shadow-[0_0_40px_rgba(52,211,153,.7)]"
                >
                  <Check size={32} strokeWidth={3} />
                </motion.div>
                <p className="font-display text-xl text-white">Restitution enregistrée</p>
                <p className="text-xs text-white/60">
                  Stock réactualisé en direct :{" "}
                  {c === "Endommagé"
                    ? "exemplaire mis en réserve pour restauration"
                    : "+1 exemplaire remis en rayon"}
                  .
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
