import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Heart } from "lucide-react";
import { Book } from "../../types/library";
import { Glass, GlowBadge, Magnetic, PRIMARY } from "../ui/primitives";

export function BookCard({
  b,
  i,
  reserved,
  favorite,
  listMode,
  onReserve,
  onOpen,
  onFavorite,
}: {
  b: Book;
  i: number;
  reserved: boolean;
  favorite: boolean;
  listMode: "grid" | "list";
  onReserve: () => void;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const avail = b.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.5 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
        }}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        <Glass className={`overflow-hidden p-4 sm:p-5 ${listMode === "list" ? "sm:flex sm:items-center sm:gap-4" : ""}`} glow={`hsla(${b.hue},80%,60%,.45)`}>
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
            className={`relative mb-4 flex items-end rounded-2xl p-4 ${listMode === "list" ? "h-24 sm:mb-0 sm:h-20 sm:w-40 sm:shrink-0" : "h-40"}`}
            style={{
              background: `linear-gradient(145deg, hsl(${b.hue} 70% 38%), hsl(${b.hue + 40} 60% 14%))`,
              transform: "translateZ(30px)",
            }}
          >
            <BookOpen className="absolute right-4 top-4 text-white/30" size={28} />
            <span className="break-words font-display text-xl leading-tight text-white/95">{b.title}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <button onClick={onOpen} className="text-left text-sm text-white/55 hover:text-white" aria-label={`Ouvrir la fiche de ${b.title}`}>{b.author}</button>
              <button type="button" onClick={onFavorite} aria-label={favorite ? `Retirer ${b.title} des favoris` : `Ajouter ${b.title} aux favoris`} aria-pressed={favorite} className={`rounded-full p-1.5 ${favorite ? "text-rose-300" : "text-white/35 hover:text-white"}`}><Heart size={16} fill={favorite ? "currentColor" : "none"} /></button>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-white/35">
              <span>{b.field}</span>
              <span>Rayon {b.shelf}</span>
            </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {avail ? (
              <GlowBadge level="ok" text={`Disponible · ${b.stock}/${b.total}`} />
            ) : (
              <GlowBadge level="yellow" text="Réservé" />
            )}
            <Magnetic
              onClick={onReserve}
              disabled={reserved}
              className={
                reserved
                  ? "bg-emerald-400/15 px-4 py-2 text-sm text-emerald-300"
                  : `${PRIMARY} !px-4 !py-2`
              }
            >
              {reserved ? (
                <>
                  <Check size={15} /> Réservé
                </>
              ) : avail ? (
                "Réserver"
              ) : (
                "File d'attente"
              )}
            </Magnetic>
          </div>
          </div>
        </Glass>
      </motion.div>
    </motion.div>
  );
}
