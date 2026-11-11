import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, MapPin, Barcode } from "lucide-react";
import { Book } from "../../types/library";

export function DeleteBookModal({
  book,
  activeLoansCount = 0,
  open,
  onClose,
  onConfirm,
}: {
  book: Book | null;
  activeLoansCount?: number;
  open: boolean;
  onClose: () => void;
  onConfirm: (bookId: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !book || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
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
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: "500px",
            maxHeight: "85vh",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 0 50px -5px rgba(244, 63, 94, 0.35), 0 25px 60px -15px rgba(0, 0, 0, 0.9)",
          }}
          className="relative flex flex-col w-[90%] max-w-[500px] max-h-[85vh] rounded-3xl overflow-hidden bg-[#0e1017] border border-rose-500/40 p-6 text-xs text-white"
        >
          {/* Top Warning Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 id="delete-dialog-title" className="font-display text-lg text-white">
                Supprimer cet ouvrage du stock ?
              </h3>
              <p className="mt-1 text-white/60 text-xs">
                Cette action est irréversible et supprimera le livre du catalogue général.
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Annuler la suppression"
              className="rounded-full bg-white/10 p-1.5 text-white/50 hover:bg-white/20 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Book Summary Card */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
            <h4 className="font-medium text-sm text-white line-clamp-1">{book.title}</h4>
            <p className="text-white/50 text-xs">
              {book.author} · {book.year} · {book.field}
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-cyan-300/80 pt-1">
              <span className="flex items-center gap-1 text-white/40">
                <Barcode size={12} /> {book.isbn}
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <MapPin size={12} /> Rayon {book.shelf}
              </span>
              <span className="text-white/60">
                {book.stock}/{book.total} ex.
              </span>
            </div>
          </div>

          {/* Active Loans Notice if any */}
          {activeLoansCount > 0 && (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
              <strong>Attention :</strong> {activeLoansCount} exemplaire(s) de cet ouvrage sont actuellement enregistrés comme empruntés. La suppression supprimera également les fiches de prêt associées.
            </div>
          )}

          {/* Confirmation Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              Annuler
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={() => onConfirm(book.id)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition shadow-[0_0_20px_-3px_rgba(244,63,94,.6)]"
            >
              <Trash2 size={14} />
              <span>Confirmer la suppression</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
