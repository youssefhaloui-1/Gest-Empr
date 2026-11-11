import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, Hash, MapPin, X, Building, Info, Barcode } from "lucide-react";
import { Book } from "../../types/library";
import { GlowBadge } from "../ui/primitives";

export function BookDetailsModal({
  book,
  onClose,
}: {
  book: Book | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!book) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [book, onClose]);

  if (!book || typeof document === "undefined") {
    return null;
  }

  const isAvailable = book.stock > 0;

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-dialog-title"
        aria-describedby="book-dialog-summary"
        ref={dialogRef}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
          onClick={(event) => event.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: "600px",
            maxHeight: "85vh",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: `0 0 45px -5px hsla(${book.hue}, 80%, 55%, 0.35), 0 25px 60px -15px rgba(0, 0, 0, 0.9)`,
          }}
          className="relative flex flex-col w-[90%] max-w-[600px] max-h-[85vh] rounded-3xl overflow-hidden bg-[#0d111c] border border-white/15"
        >
          {/* Header - Fixed & always visible at top */}
          <div
            style={{
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
            className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6 bg-[#0f1422]"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-white/70">
                {book.id}
              </span>
              <p className="text-xs uppercase tracking-[0.16em] text-white/50 font-medium">
                Fiche de consultation
              </p>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              type="button"
              aria-label="Fermer la fiche"
              className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body with overflow-y: auto */}
          <div
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
            }}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
          >
            {/* Cover Banner */}
            <div
              className="relative flex min-h-28 sm:min-h-32 items-end rounded-2xl p-4 sm:p-5 shadow-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${book.hue} 70% 36%), hsl(${book.hue + 40} 60% 12%))`,
              }}
            >
              <BookOpen className="absolute right-4 top-4 text-white/25" size={32} />
              <div className="z-10 pr-6">
                <span className="block text-[11px] uppercase tracking-wider text-white/60 mb-1 font-medium">
                  {book.field}
                </span>
                <h2
                  id="book-dialog-title"
                  className="font-display text-xl sm:text-2xl leading-tight text-white"
                >
                  {book.title}
                </h2>
              </div>
            </div>

            {/* Author & Availability Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div>
                <p className="text-[11px] text-white/45">Auteur(s)</p>
                <p className="text-sm font-medium text-white/90">{book.author}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {isAvailable ? (
                  <GlowBadge
                    level="ok"
                    text={`En rayon (${book.stock}/${book.total} ex.)`}
                  />
                ) : (
                  <GlowBadge
                    level="yellow"
                    text={`Tous sortis (0/${book.total})`}
                  />
                )}
                <span className="rounded-lg bg-indigo-500/15 border border-indigo-400/30 px-2 py-1 text-xs text-indigo-300 font-mono flex items-center gap-1">
                  <MapPin size={12} /> Rayon {book.shelf}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <p className="text-xs text-white/50 font-medium mb-1">Résumé de l'ouvrage</p>
              <p
                id="book-dialog-summary"
                className="text-xs sm:text-sm leading-relaxed text-white/75 bg-white/[0.03] border border-white/5 p-3 rounded-xl"
              >
                {book.summary}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <Building size={14} className="text-white/40 shrink-0" />
                <span className="truncate">
                  Éditeur : <strong className="text-white/90">{book.publisher}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CalendarDays size={14} className="text-white/40 shrink-0" />
                <span>
                  Année : <strong className="text-white/90">{book.year}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70 font-mono">
                <Barcode size={14} className="text-white/40 shrink-0" />
                <span className="truncate">ISBN : {book.isbn}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Hash size={14} className="text-white/40 shrink-0" />
                <span className="truncate">Cote : {book.shelf}</span>
              </div>
            </div>

            {/* In-person Borrowing Notice */}
            <div className="rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-3.5 text-xs leading-relaxed text-indigo-200">
              <div className="flex items-start gap-2.5">
                <Info size={16} className="shrink-0 text-indigo-300 mt-0.5" />
                <div>
                  <p className="font-semibold text-indigo-100">Modalités d'emprunt au guichet</p>
                  <p className="mt-1 text-indigo-200/80">
                    {isAvailable ? (
                      <>
                        Cet ouvrage est disponible en rayon. Pour l'emprunter, rendez-vous au{" "}
                        <strong>Rayon {book.shelf}</strong> puis présentez-vous au guichet avec votre
                        carte d'adhérent pour faire enregistrer votre prêt par le bibliothécaire (durée : 21 jours).
                      </>
                    ) : (
                      <>
                        Tous les exemplaires sont actuellement empruntés. Renseignez-vous auprès du guichet de
                        prêt pour la date de restitution prévue ou les alternatives disponibles.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom of modal */}
          <div
            style={{
              flexShrink: 0,
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
            className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0f1422] px-5 py-3 sm:px-6"
          >
            <span className="text-[11px] text-white/40">
              Consultation sur place · Prêt au guichet
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
