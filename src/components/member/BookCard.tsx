import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { BookOpen, Heart, MapPin, Eye, Hash } from "lucide-react";
import { Book } from "../../types/library";
import { Glass, GlowBadge } from "../ui/primitives";

export function BookCard({
  b,
  i,
  favorite,
  listMode,
  onOpen,
  onFavorite,
}: {
  b: Book;
  i: number;
  favorite: boolean;
  listMode: "grid" | "list";
  onOpen: () => void;
  onFavorite: () => void;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const isAvailable = b.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.4 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
        }}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        <Glass
          className={`overflow-hidden p-4 sm:p-5 transition hover:border-white/20 ${
            listMode === "list" ? "sm:flex sm:items-center sm:gap-4" : ""
          }`}
          glow={`hsla(${b.hue},80%,60%,.35)`}
        >
          {/* Book Banner with Gradient Cover */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Voir les détails de ${b.title}`}
            onClick={onOpen}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }}
            className={`relative mb-3.5 flex items-end rounded-2xl p-4 cursor-pointer group transition ${
              listMode === "list" ? "h-24 sm:mb-0 sm:h-20 sm:w-44 sm:shrink-0" : "h-36"
            }`}
            style={{
              background: `linear-gradient(145deg, hsl(${b.hue} 70% 36%), hsl(${b.hue + 35} 60% 12%))`,
              transform: "translateZ(20px)",
            }}
          >
            <BookOpen
              className="absolute right-3.5 top-3.5 text-white/35 transition group-hover:scale-110 group-hover:text-white/60"
              size={24}
            />
            <div className="min-w-0 pr-4">
              <span className="block break-words font-display text-lg sm:text-xl leading-tight text-white/95 line-clamp-2">
                {b.title}
              </span>
            </div>
          </div>

          {/* Book Information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={onOpen}
                className="text-left text-xs sm:text-sm font-medium text-white/80 hover:text-white line-clamp-1"
                aria-label={`Ouvrir la fiche de ${b.title}`}
              >
                {b.author}
              </button>
              <button
                type="button"
                onClick={onFavorite}
                aria-label={favorite ? `Retirer ${b.title} des favoris` : `Ajouter ${b.title} aux favoris`}
                aria-pressed={favorite}
                className={`rounded-full p-1.5 transition ${
                  favorite ? "text-rose-400 bg-rose-400/10" : "text-white/35 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart size={15} fill={favorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px] text-white/45">
              <span className="rounded bg-white/5 px-1.5 py-0.5">{b.field}</span>
              <span className="flex items-center gap-1 font-mono text-indigo-300/80">
                <MapPin size={11} /> Rayon {b.shelf}
              </span>
            </div>

            <div className="mt-1 text-[10px] text-white/35 font-mono flex items-center gap-1">
              <Hash size={10} /> ISBN {b.isbn}
            </div>

            {/* Availability & In-Person Notice (No online reservation) */}
            <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              {isAvailable ? (
                <GlowBadge
                  level="ok"
                  text={`En rayon · ${b.stock}/${b.total} dispo`}
                />
              ) : (
                <GlowBadge
                  level="yellow"
                  text="Tous exemplaires prêtés"
                />
              )}

              <button
                type="button"
                onClick={onOpen}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white transition"
              >
                <Eye size={13} /> Consulter
              </button>
            </div>
          </div>
        </Glass>
      </motion.div>
    </motion.div>
  );
}
