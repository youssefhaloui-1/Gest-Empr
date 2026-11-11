import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  Barcode,
  Camera,
  CameraOff,
  Plus,
  BookOpen,
  Check,
  AlertCircle,
  MapPin,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { Book, Loan } from "../../types/library";
import { Glass, GlowBadge } from "../ui/primitives";

// Web Audio synthesizer for scanner beep
function playScannerBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1300, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Audio context may be restricted without prior user gesture
  }
}

export function ScanHub({
  books,
  loans,
  onFoundLoan,
  onAddCopies,
  onOpenNewBookModal,
}: {
  books: Book[];
  loans: Loan[];
  onFoundLoan: (l: Loan) => void;
  onAddCopies: (bookId: string, quantity: number) => void;
  onOpenNewBookModal: (scannedIsbn: string) => void;
}) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedBook, setMatchedBook] = useState<Book | null>(null);
  const [matchedLoan, setMatchedLoan] = useState<Loan | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [restockSuccess, setRestockSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Process barcode lookup
  const processScan = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim();
      if (!code) return;

      playScannerBeep();
      setLastScannedCode(code);
      setRestockSuccess(null);

      // 1. Search in Books by ISBN, ID, or clean code
      const cleanCode = code.replace(/[-\s]/g, "").toLowerCase();
      const foundBook = books.find(
        (b) =>
          b.isbn.replace(/[-\s]/g, "").toLowerCase() === cleanCode ||
          b.id.toLowerCase() === code.toLowerCase()
      );

      // 2. Search in Loans by Loan ID or Book ID
      const foundLoan = loans.find(
        (l) =>
          l.id.toLowerCase() === code.toLowerCase() ||
          (foundBook && l.bookId === foundBook.id)
      );

      if (foundBook) {
        setMatchedBook(foundBook);
        setMatchedLoan(foundLoan ?? null);
      } else {
        setMatchedBook(null);
        setMatchedLoan(null);
      }
    },
    [books, loans]
  );

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Track stop error:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  // Start Camera with standard Web getUserMedia API
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "L'accès à la caméra n'est pas pris en charge par votre navigateur ou ce contexte (requiert HTTPS ou localhost)."
        );
      }

      let stream: MediaStream | null = null;

      // 1. First attempt with back camera (environment)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        console.warn("Attempt with facingMode: environment failed, trying standard video...", err);
        // 2. Fallback attempt with any available camera (laptop webcam, default camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Flux vidéo indisponible.");
      }

      streamRef.current = stream;

      // Bind stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("video.play() was interrupted or waiting for user gesture:", playErr);
        }
      }

      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name === "NotAllowedError" || errorObj?.name === "PermissionDeniedError") {
        setCameraError(
          "Accès à la caméra refusé. Veuillez autoriser l'accès à la webcam dans les paramètres de votre navigateur."
        );
      } else if (errorObj?.name === "NotFoundError" || errorObj?.name === "DevicesNotFoundError") {
        setCameraError(
          "Aucune caméra ou webcam détectée sur cet appareil. Utilisez la saisie ou la simulation rapide."
        );
      } else if (errorObj?.name === "NotReadableError" || errorObj?.name === "TrackStartError") {
        setCameraError("La caméra est déjà sollicitée par une autre application.");
      } else {
        setCameraError(
          errorObj?.message ||
            "Impossible d'activer la caméra vidéo. Vérifiez les autorisations de votre navigateur."
        );
      }
      stopCamera();
    } finally {
      setIsCameraLoading(false);
    }
  };

  const toggleCamera = () => {
    if (isCameraActive || isCameraLoading) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // BarcodeDetector automatic scanning loop on video frames
  useEffect(() => {
    if (!isCameraActive || typeof window === "undefined" || !("BarcodeDetector" in window)) {
      return;
    }

    let isScanning = true;
    try {
      type Detector = { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
      const DetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => Detector }).BarcodeDetector;
      const detector = new DetectorClass({
        formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a"],
      });

      const interval = setInterval(async () => {
        if (!isScanning || !videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results && results.length > 0 && isScanning) {
            const code = results[0].rawValue;
            if (code && code !== lastScannedCode) {
              processScan(code);
            }
          }
        } catch {
          // ignore detection frame drops
        }
      }, 350);

      return () => {
        isScanning = false;
        clearInterval(interval);
      };
    } catch (e) {
      console.warn("BarcodeDetector could not be initialized:", e);
    }
  }, [isCameraActive, lastScannedCode, processScan]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      processScan(barcodeInput);
      setBarcodeInput("");
    }
  };

  const handleAddCopy = (book: Book) => {
    onAddCopies(book.id, 1);
    playScannerBeep();
    setRestockSuccess(`+1 exemplaire ajouté avec succès à « ${book.title} » !`);
    setMatchedBook({ ...book, stock: book.stock + 1, total: book.total + 1 });
    setTimeout(() => setRestockSuccess(null), 3500);
  };

  // Demo barcodes for quick test
  const demoBarcodes = [
    { label: "Algorithms (MIT)", code: "978-0262046305", id: "LIV-1001" },
    { label: "Clean Code", code: "978-0132350884", id: "LIV-1020" },
    { label: "Mécanique quantique", code: "978-2759810804", id: "LIV-1002" },
    { label: "Nouveau livre (inconnu)", code: "978-2100999888", id: "NEW-BARCODE" },
  ];

  return (
    <Glass className="p-5 sm:p-6" glow="rgba(34,211,238,.4)">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine size={20} className="text-cyan-300" />
          <h3 className="font-display text-xl">Lecteur de code-barres</h3>
        </div>
        <button
          type="button"
          onClick={toggleCamera}
          disabled={isCameraLoading}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            isCameraActive
              ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,.3)]"
              : "border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/60"
          }`}
        >
          {isCameraLoading ? (
            <>
              <RefreshCw size={14} className="animate-spin text-cyan-300" />
              <span>Connexion…</span>
            </>
          ) : isCameraActive ? (
            <>
              <CameraOff size={14} className="text-emerald-300" />
              <span>Arrêter la caméra</span>
            </>
          ) : (
            <>
              <Camera size={14} className="text-cyan-300" />
              <span>Caméra vidéo</span>
            </>
          )}
        </button>
      </div>

      {/* Holographic / Video Viewfinder */}
      <div className="relative mb-3.5 grid h-48 place-items-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-black/80 shadow-inner">
        {/* The video element is ALWAYS mounted in DOM so videoRef is never null */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isCameraActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
          }`}
        />

        {/* Viewfinder Target Corner Reticles */}
        {[
          "left-3 top-3 border-l-2 border-t-2",
          "right-3 top-3 border-r-2 border-t-2",
          "left-3 bottom-3 border-l-2 border-b-2",
          "right-3 bottom-3 border-r-2 border-b-2",
        ].map((c) => (
          <span key={c} className={`absolute h-7 w-7 border-cyan-400 z-10 ${c}`} />
        ))}

        {/* Laser beam animation */}
        <motion.div
          animate={{ top: ["10%", "85%", "10%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 right-4 h-0.5 bg-cyan-300 shadow-[0_0_20px_4px_rgba(103,232,249,.85)] z-10"
        />

        {/* Central HUD Status */}
        <div className="z-10 bg-black/75 px-3.5 py-1.5 rounded-full border border-cyan-400/40 flex items-center gap-2 backdrop-blur-md">
          {isCameraActive ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-emerald-200 font-medium">
                Flux caméra direct · Placez le code-barres
              </span>
            </>
          ) : (
            <>
              <Barcode size={14} className="text-cyan-300" />
              <span className="text-[11px] text-cyan-200/90">
                Douchette laser USB connectée ou saisie directe
              </span>
            </>
          )}
        </div>
      </div>

      {/* Clear error alert if camera access is refused or fails */}
      <AnimatePresence>
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3.5 rounded-xl border border-rose-400/40 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-100">Caméra non disponible</p>
              <p className="mt-0.5 text-rose-200/90">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-500/20 px-2.5 py-1 text-[11px] text-rose-200 border border-rose-400/40 hover:bg-rose-500/30 transition"
              >
                <RefreshCw size={11} /> Réessayer l'accès caméra
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Input (Keyboard / Laser Emulation) */}
      <form onSubmit={handleScanSubmit} className="space-y-2">
        <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 ring-1 ring-white/10 focus-within:ring-cyan-300/60 transition">
          <Barcode size={18} className="text-cyan-300 shrink-0" />
          <input
            ref={inputRef}
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Scannez ou tapez l'ISBN (ex: 978-0262046305)…"
            aria-label="Code-barres à scanner"
            className="w-full bg-transparent text-sm font-mono text-white outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-400/20 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/30 transition shrink-0"
          >
            Valider
          </button>
        </div>
      </form>

      {/* Quick Test Barcodes */}
      <div className="mt-3">
        <p className="text-[11px] text-white/45 mb-1.5 flex items-center gap-1">
          <Volume2 size={12} className="text-cyan-400" />
          Simulation de scan rapide au laser :
        </p>
        <div className="flex flex-wrap gap-1.5">
          {demoBarcodes.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => processScan(item.code)}
              className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-400/25 transition"
            >
              ⚡ {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Results Panel */}
      <AnimatePresence mode="wait">
        {restockSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-3 text-xs text-emerald-200"
          >
            <Check size={16} className="text-emerald-300" />
            <span>{restockSuccess}</span>
          </motion.div>
        )}

        {lastScannedCode && matchedBook && (
          <motion.div
            key={matchedBook.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-mono text-cyan-300">
                  Code reconnu : {matchedBook.isbn}
                </span>
                <h4 className="font-display text-base text-white">{matchedBook.title}</h4>
                <p className="text-xs text-white/60">{matchedBook.author} · {matchedBook.field}</p>
              </div>
              <GlowBadge
                level={matchedBook.stock > 0 ? "ok" : "yellow"}
                text={`${matchedBook.stock}/${matchedBook.total} en stock`}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-cyan-200/80 font-mono">
              <MapPin size={13} /> Rayon : <strong>{matchedBook.shelf}</strong>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-400/20">
              <button
                type="button"
                onClick={() => handleAddCopy(matchedBook)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/25 border border-emerald-400/40 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/35 transition"
              >
                <Plus size={14} /> Réapprovisionner (+1 ex.)
              </button>

              {matchedLoan ? (
                <button
                  type="button"
                  onClick={() => onFoundLoan(matchedLoan)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-400/30 transition"
                >
                  <BookOpen size={14} /> Fiche de prêt
                </button>
              ) : (
                <span className="flex items-center justify-center text-[11px] text-white/50 italic py-1">
                  Aucun prêt actif
                </span>
              )}
            </div>
          </motion.div>
        )}

        {lastScannedCode && !matchedBook && (
          <motion.div
            key="unmatched"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-amber-200">
                  Nouveau code-barres détecté : <span className="font-mono">{lastScannedCode}</span>
                </p>
                <p className="mt-1 text-xs text-amber-200/80">
                  Cet ouvrage n'est pas encore enregistré dans le catalogue de la bibliothèque.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewBookModal(lastScannedCode)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2 text-xs font-semibold text-black hover:bg-amber-300 transition"
            >
              <Plus size={15} /> Ajouter cet ouvrage au catalogue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Glass>
  );
}