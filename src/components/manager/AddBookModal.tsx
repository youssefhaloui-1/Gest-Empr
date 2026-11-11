import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, BookOpen, Barcode, Check } from "lucide-react";
import { Book } from "../../types/library";
import { Magnetic, PRIMARY } from "../ui/primitives";

export function AddBookModal({
  open,
  initialIsbn = "",
  onClose,
  onAddBook,
}: {
  open: boolean;
  initialIsbn?: string;
  onClose: () => void;
  onAddBook: (book: Book) => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [field, setField] = useState("Informatique");
  const [shelf, setShelf] = useState("INF-050");
  const [year, setYear] = useState("2024");
  const [publisher, setPublisher] = useState("Dunod");
  const [isbn, setIsbn] = useState(initialIsbn);
  const [total, setTotal] = useState("3");
  const [summary, setSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialIsbn) {
      setIsbn(initialIsbn);
    }
  }, [initialIsbn]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim() || !author.trim() || !isbn.trim()) return;

    const copies = Math.max(1, parseInt(total) || 1);
    const newBook: Book = {
      id: `LIV-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      author: author.trim(),
      field: field.trim(),
      stock: copies,
      total: copies,
      hue: Math.floor(Math.random() * 360),
      shelf: shelf.trim() || "GEN-001",
      year: parseInt(year) || 2024,
      publisher: publisher.trim() || "Éditions Universitaires",
      isbn: isbn.trim(),
      summary:
        summary.trim() ||
        `Ouvrage de référence en ${field.toLowerCase()} rédigé par ${author.trim()}.`,
    };

    onAddBook(newBook);
    onClose();
    // Reset fields
    setTitle("");
    setAuthor("");
    setSummary("");
    setSubmitted(false);
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-book-dialog-title"
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
            maxWidth: "580px",
            maxHeight: "85vh",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 0 45px -5px rgba(34, 211, 238, 0.35), 0 25px 60px -15px rgba(0, 0, 0, 0.9)",
          }}
          className="relative flex flex-col w-[90%] max-w-[580px] max-h-[85vh] rounded-3xl overflow-hidden bg-[#0d111c] border border-cyan-400/30"
        >
          {/* Header - Fixed & always visible at top */}
          <div
            style={{
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
            className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0f1422]"
          >
            <div className="flex items-center gap-2.5 text-cyan-300">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300">
                <Plus size={18} />
              </span>
              <div>
                <h3 id="add-book-dialog-title" className="font-display text-lg sm:text-xl text-white">
                  Ajouter un ouvrage au stock
                </h3>
                <p className="text-xs text-white/50">Enregistrement dans le catalogue et attribution de rayon</p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer la fenêtre d'ajout"
              className="rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Body with max-height & overflow-y: auto */}
          <form
            onSubmit={handleSubmit}
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
            }}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
          >
            <div>
              <label className="block text-white/80 mb-1.5 font-medium">Titre de l'ouvrage *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Programmation concurrente en Go"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Auteur(s) *</label>
                <input
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Alan Donovan"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Code-barres / ISBN *</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40">
                  <Barcode size={16} className="text-cyan-400 shrink-0" />
                  <input
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-…"
                    className="w-full bg-transparent text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Discipline / Genre</label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121827] px-3 py-2.5 text-white outline-none"
                >
                  <option>Informatique</option>
                  <option>Mathématiques</option>
                  <option>Physique</option>
                  <option>Chimie</option>
                  <option>Biologie</option>
                  <option>Littérature</option>
                  <option>Philosophie</option>
                  <option>Histoire</option>
                  <option>Économie</option>
                  <option>Droit</option>
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Rayon / Étagère</label>
                <input
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  placeholder="INF-045"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Exemplaires</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Éditeur</label>
                <input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Dunod, Pearson, MIT Press…"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-1.5 font-medium">Année d'édition</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-1.5 font-medium">Résumé de l'ouvrage</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brève description du contenu pour les étudiants et chercheurs universitaires…"
                className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Footer - Fixed at bottom */}
            <div
              style={{
                flexShrink: 0,
                position: "sticky",
                bottom: 0,
                zIndex: 10,
              }}
              className="flex shrink-0 items-center justify-end gap-2 border-t border-white/10 bg-[#0f1422] pt-3 pb-1 -mx-5 px-5 sm:-mx-6 sm:px-6"
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                Annuler
              </button>
              <Magnetic
                type="submit"
                className="rounded-xl bg-cyan-400 px-5 py-2 font-semibold text-black hover:bg-cyan-300 transition shadow-[0_0_20px_-4px_rgba(34,211,238,.6)]"
              >
                Ajouter au catalogue
              </Magnetic>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
