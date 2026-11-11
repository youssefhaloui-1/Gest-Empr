import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, CalendarClock, BookOpen, User, Hash, MapPin } from "lucide-react";
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const b = loan && books.find((x) => x.id === loan.bookId);
  const m = loan && MEMBERS.find((x) => x.id === loan.memberId);

  useEffect(() => {
    if (!loan) return;
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
  }, [loan, onClose]);

  if (!loan || !b || !m || typeof document === "undefined") {
    return null;
  }

  const lv = radar(loan.dueIn);

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspector-dialog-title"
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
            maxWidth: "620px",
            maxHeight: "85vh",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: `0 0 45px -5px ${RADAR[lv].c}44, 0 25px 60px -15px rgba(0, 0, 0, 0.9)`,
          }}
          className="relative flex flex-col w-[90%] max-w-[620px] max-h-[85vh] rounded-3xl overflow-hidden bg-[#0d111c] border border-white/15"
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
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <User size={18} />
              </span>
              <div>
                <h3 id="inspector-dialog-title" className="font-display text-lg sm:text-xl text-white">
                  Inspection du prêt {loan.id}
                </h3>
                <p className="text-xs text-white/50">Consultation croisée de l'adhérent et de l'ouvrage</p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer l'inspection"
              className="rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition"
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
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
          >
            {/* Status Radar Banner */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl border"
              style={{
                borderColor: `${RADAR[lv].c}44`,
                background: `${RADAR[lv].c}15`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock size={20} style={{ color: RADAR[lv].c }} />
                <div>
                  <p className="font-semibold text-white">Échéance de restitution</p>
                  <p className="text-xs text-white/70">{dueText(loan.dueIn)}</p>
                </div>
              </div>
              <GlowBadge level={lv} />
            </div>

            {/* Book & Member Dual Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Book Details */}
              <Glass className="p-4" glow={`hsla(${b.hue},80%,60%,.4)`}>
                <div
                  className="mb-3.5 flex h-24 items-end rounded-xl p-3"
                  style={{
                    background: `linear-gradient(145deg, hsl(${b.hue} 70% 36%), hsl(${b.hue + 40} 60% 12%))`,
                  }}
                >
                  <BookOpen className="absolute right-3 top-3 text-white/30" size={20} />
                  <span className="font-display text-base leading-tight text-white line-clamp-2">
                    {b.title}
                  </span>
                </div>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <dt className="text-white/45">Auteur</dt>
                    <dd className="font-medium text-white truncate">{b.author}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <dt className="text-white/45">Discipline</dt>
                    <dd className="text-white">{b.field}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-1 font-mono">
                    <dt className="text-white/45">Rayon</dt>
                    <dd className="text-indigo-300 font-semibold">{b.shelf}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-1 font-mono">
                    <dt className="text-white/45">ISBN</dt>
                    <dd className="text-white/70">{b.isbn}</dd>
                  </div>
                  <div className="flex justify-between gap-2 pt-0.5">
                    <dt className="text-white/45">Stock en rayon</dt>
                    <dd className="font-medium text-emerald-300">{b.stock} / {b.total} ex.</dd>
                  </div>
                </dl>
              </Glass>

              {/* Member Profile */}
              <Glass className="p-4" glow="rgba(168,85,247,.35)">
                <div className="mb-3.5 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-indigo-600 font-display text-lg text-white">
                    {m.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white truncate">{m.name}</p>
                    <p className="text-xs text-white/45 font-mono">{m.id}</p>
                  </div>
                </div>

                <p className="text-xs text-indigo-300/80 mb-3">{m.role}</p>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white/45">Indice de ponctualité</span>
                      <span className="font-bold text-white">{m.reliability}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.reliability}%`,
                          backgroundColor:
                            m.reliability > 75
                              ? "#10b981"
                              : m.reliability > 50
                              ? "#f59e0b"
                              : "#f43f5e",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="font-display text-lg text-white">{m.history}</p>
                      <p className="text-[10px] text-white/45">prêts honorés</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="font-display text-lg text-white">{m.late}</p>
                      <p className="text-[10px] text-white/45">retards passés</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-white/70 truncate">
                      <Mail size={13} className="text-white/40 shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Phone size={13} className="text-white/40 shrink-0" />
                      <span>{m.phone}</span>
                    </div>
                  </div>
                </div>
              </Glass>
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
            className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0f1422] px-6 py-3.5"
          >
            <span className="text-xs text-white/45">Dossier de prêt bibliothèque</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
            >
              Fermer la fiche
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}