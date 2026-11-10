import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, CornerDownLeft } from "lucide-react";
import { Loan, radar } from "../../types/library";
import { MEMBERS } from "../../data/mockData";
import { Glass, GlowBadge } from "../ui/primitives";

export function ScanHub({
  loans,
  onFound,
}: {
  loans: Loan[];
  onFound: (l: Loan) => void;
}) {
  const [v, setV] = useState("");
  const matches =
    v.length >= 2
      ? loans.filter((l) =>
          (l.bookId + l.memberId + l.id).toLowerCase().includes(v.toLowerCase())
        )
      : [];

  return (
    <Glass className="p-5 sm:p-6" glow="rgba(34,211,238,.4)">
      <div className="mb-4 flex items-center gap-2">
        <ScanLine size={18} className="text-cyan-300" />
        <h3 className="font-display text-xl">Hub de scan</h3>
      </div>
      <div className="relative mb-4 grid h-36 place-items-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/40 sm:h-40">
        {[
          "left-3 top-3 border-l-2 border-t-2",
          "right-3 top-3 border-r-2 border-t-2",
          "left-3 bottom-3 border-l-2 border-b-2",
          "right-3 bottom-3 border-r-2 border-b-2",
        ].map((c) => (
          <span key={c} className={`absolute h-7 w-7 border-cyan-300 ${c}`} />
        ))}
        <motion.div
          animate={{ top: ["12%", "82%", "12%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 right-4 h-0.5 bg-cyan-300 shadow-[0_0_18px_4px_rgba(103,232,249,.7)]"
        />
        <span className="text-xs text-cyan-200/50">
          Présentez le QR code devant la caméra
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-3 ring-1 ring-white/10 focus-within:ring-cyan-300/50">
        <CornerDownLeft size={16} className="text-white/30" />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="N° ID : ETU-22340, LIV-1004…"
          aria-label="Rechercher un prêt par identifiant"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
        />
      </div>
      <AnimatePresence>
        {matches.map((l) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onFound(l);
              setV("");
            }}
            className="mt-2 flex w-full items-center justify-between rounded-xl bg-cyan-300/10 px-3 py-2.5 text-left text-sm hover:bg-cyan-300/20"
          >
            <span>
              {l.id} · {MEMBERS.find((m) => m.id === l.memberId)?.name}
            </span>
            <GlowBadge level={radar(l.dueIn)} />
          </motion.button>
        ))}
      </AnimatePresence>
      {v.length >= 2 && !matches.length && (
        <p className="mt-3 text-xs text-white/40">Aucun prêt actif pour « {v} ».</p>
      )}
    </Glass>
  );
}