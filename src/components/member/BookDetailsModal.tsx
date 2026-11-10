import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, Hash, MapPin, X } from "lucide-react";
import { Book } from "../../types/library";
import { Glass, GlowBadge, Magnetic, PRIMARY } from "../ui/primitives";

export function BookDetailsModal({
  book,
  reserved,
  onClose,
  onReserve,
}: {
  book: Book | null;
  reserved: boolean;
  onClose: () => void;
  onReserve: () => void;
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
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"));
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

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-dialog-title"
          aria-describedby="book-dialog-summary"
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.97 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto"
          >
            <Glass className="overflow-hidden bg-[#0f1320]/95" glow={`hsla(${book.hue},80%,60%,.5)`}>
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Fiche ouvrage</p>
                <button ref={closeRef} onClick={onClose} aria-label="Fermer la fiche" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-5 p-4 sm:grid-cols-[220px_1fr] sm:gap-6 sm:p-7">
                <div
                  className="relative flex min-h-48 items-end rounded-3xl p-5 shadow-2xl sm:min-h-64"
                  style={{ background: `linear-gradient(145deg, hsl(${book.hue} 70% 38%), hsl(${book.hue + 40} 60% 14%))` }}
                >
                  <BookOpen className="absolute right-5 top-5 text-white/35" size={34} />
                  <span className="font-display text-2xl leading-tight">{book.title}</span>
                </div>
                <div>
                  <h2 id="book-dialog-title" className="font-display text-3xl leading-tight sm:text-4xl">{book.title}</h2>
                  <p className="mt-2 text-white/65">{book.author}</p>
                  <p id="book-dialog-summary" className="mt-4 text-sm leading-6 text-white/60">{book.summary}</p>
                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <span className="flex items-center gap-2 text-white/60"><MapPin size={15} /> Rayon {book.shelf}</span>
                    <span className="flex items-center gap-2 text-white/60"><CalendarDays size={15} /> Édition {book.year}</span>
                    <span className="flex items-center gap-2 text-white/60"><Hash size={15} /> {book.isbn}</span>
                    <span className="text-white/60">{book.publisher}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <GlowBadge level={book.stock > 0 ? "ok" : "yellow"} text={book.stock > 0 ? `${book.stock} exemplaire${book.stock > 1 ? "s" : ""} disponible${book.stock > 1 ? "s" : ""}` : "Aucun exemplaire · file d'attente"} />
                    <Magnetic onClick={onReserve} disabled={reserved} className={reserved ? "min-h-11 bg-emerald-400/15 px-5 text-sm text-emerald-300" : `${PRIMARY} min-h-11`}>
                      {reserved ? "Réservation active" : book.stock > 0 ? "Réserver" : "Rejoindre la file"}
                    </Magnetic>
                  </div>
                </div>
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
