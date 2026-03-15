import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, ChevronLeft, X } from "lucide-react";
import type { CreativeBriefData } from "@/types/amadeus";

interface Props {
  brief: CreativeBriefData;
  clipCount: number;
  onBriefChange: (brief: CreativeBriefData) => void;
  onContinue: () => void;
  onReanalyse: () => void;
  onBack: () => void;
}

function AnimatedNumber({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{value}</>;
}

const ENERGY_EMOJI: Record<string, string> = {
  "High Energy": "⚡", "Chill": "😌", "Emotional": "🥹", "Cinematic": "🎬",
  "Playful": "😄", "Mysterious": "🌙", "Romantic": "🌹", "Rebellious": "🔥",
};

const ENERGY_OPTIONS = [
  { label: "High Energy", emoji: "⚡" },
  { label: "Chill", emoji: "😌" },
  { label: "Emotional", emoji: "🥹" },
  { label: "Cinematic", emoji: "🎬" },
  { label: "Playful", emoji: "😄" },
  { label: "Mysterious", emoji: "🌙" },
  { label: "Romantic", emoji: "🌹" },
  { label: "Rebellious", emoji: "🔥" },
];

const MUSIC_OPTIONS = [
  { label: "Hip Hop", emoji: "🎤" },
  { label: "Cinematic", emoji: "🎻" },
  { label: "Lo-Fi", emoji: "☁️" },
  { label: "Electronic", emoji: "🎛️" },
  { label: "Acoustic", emoji: "🎸" },
  { label: "Pop", emoji: "✨" },
  { label: "Jazz", emoji: "🎷" },
  { label: "Ambient", emoji: "🌊" },
];

type EditingField = "energy" | "style" | "references" | null;

function getDetectedTheme(brief: CreativeBriefData): string {
  const energy = brief.overall_energy.toLowerCase();
  if (["emotional", "romantic"].includes(energy)) return "Personal story";
  if (["cinematic", "mysterious"].includes(energy)) return "Narrative drama";
  if (["high energy", "rebellious"].includes(energy)) return "Action / hype";
  if (["playful"].includes(energy)) return "Lifestyle / vlog";
  return "Creative project";
}

function getSuggestedStyle(brief: CreativeBriefData): string {
  const style = brief.music_style_direction;
  const energy = brief.overall_energy.toLowerCase();
  if (style === "Hip Hop" && ["chill", "emotional"].includes(energy)) return "Lo-fi hip hop";
  if (style === "Hip Hop") return "Boom-bap hip hop";
  if (style === "Cinematic" && energy === "emotional") return "Orchestral strings";
  if (style === "Cinematic") return "Epic cinematic";
  if (style === "Lo-Fi") return "Lo-fi beats";
  if (style === "Electronic" && energy === "chill") return "Downtempo electronic";
  if (style === "Electronic") return "Synth-driven electronic";
  return `${energy} ${style.toLowerCase()}`;
}

export default function ScoreBrief({ brief, clipCount, onBriefChange, onContinue, onReanalyse, onBack }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [flashOut, setFlashOut] = useState(false);
  const [editing, setEditing] = useState<EditingField>(null);
  const [editReferences, setEditReferences] = useState(brief.references_text ?? "");

  const handleContinue = useCallback(() => {
    setFlashOut(true);
    setTimeout(onContinue, 400);
  }, [onContinue]);

  const handleSelectEnergy = useCallback((label: string) => {
    onBriefChange({ ...brief, overall_energy: label });
    setEditing(null);
  }, [brief, onBriefChange]);

  const handleSelectStyle = useCallback((label: string) => {
    onBriefChange({ ...brief, music_style_direction: label });
    setEditing(null);
  }, [brief, onBriefChange]);

  const handleSaveReferences = useCallback(() => {
    onBriefChange({ ...brief, references_text: editReferences });
    setEditing(null);
  }, [brief, editReferences, onBriefChange]);

  const openEdit = useCallback((field: EditingField) => {
    if (field === "references") setEditReferences(brief.references_text ?? "");
    setEditing(field);
  }, [brief.references_text]);

  const confirmReanalyse = useCallback(() => {
    onReanalyse();
  }, [onReanalyse]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

   const detectedTheme = getDetectedTheme(brief);
   const suggestedStyle = getSuggestedStyle(brief);
   const dominantVisual = "Speaker, warm lighting";

   const infoRows = [
     { label: "Detected Theme", value: detectedTheme },
     { label: "Dominant Visual", value: dominantVisual },
   ];

  const cards = [
    { icon: ENERGY_EMOJI[brief.overall_energy] || "⚡", value: brief.overall_energy, label: "Your energy", field: "energy" as EditingField },
    { icon: "🎵", value: brief.music_style_direction, label: "Your style", field: "style" as EditingField },
    { icon: "✨", value: brief.references_text?.trim() || "—", label: "Inspiration", field: "references" as EditingField },
  ];

  return (
    <>
      {/* White flash overlay */}
      <AnimatePresence>
        {flashOut && (
          <motion.div
            className="fixed inset-0 z-[100] bg-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-auto py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: flashOut ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <div className="w-full max-w-[640px] mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <motion.div
          className="w-full max-w-[640px] bg-card border border-border rounded-[20px] p-8 md:p-10"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center">
              <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-primary mb-2">
                Based on your video
              </p>
            </motion.div>

            {/* Detected info rows */}
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </motion.div>

            {/* Selection cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
              {cards.map((card) => (
                <motion.div
                  key={card.label}
                  className="relative bg-background border border-border rounded-xl p-4 flex flex-col items-center gap-2 group cursor-pointer"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => openEdit(card.field)}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-sm font-semibold text-foreground text-center truncate w-full">{card.value}</span>
                  <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground">
                    <Pencil className="w-3 h-3" />
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
              <button
                onClick={handleContinue}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Take me to my video →
              </button>

              <AnimatePresence mode="wait">
                {showConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center flex flex-col items-center gap-2"
                  >
                    <p className="text-xs text-muted-foreground">This will reset your selections. Continue?</p>
                    <div className="flex gap-4">
                      <button onClick={confirmReanalyse} className="text-xs text-primary hover:underline">
                        Yes, start fresh
                      </button>
                      <button onClick={() => setShowConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowConfirm(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Not quite right? Start over
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Edit Overlay */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)} />

            <motion.div
              className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setEditing(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {editing === "energy" && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Change energy</h3>
                  <p className="text-sm text-muted-foreground mb-5">What's the energy of your video?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ENERGY_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleSelectEnergy(opt.label)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          brief.overall_energy === opt.label
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editing === "style" && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Change style</h3>
                  <p className="text-sm text-muted-foreground mb-5">What kind of music fits the vibe?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleSelectStyle(opt.label)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          brief.music_style_direction === opt.label
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editing === "references" && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Change inspiration</h3>
                  <p className="text-sm text-muted-foreground mb-5">Any artists or tracks for inspiration?</p>
                  <input
                    autoFocus
                    value={editReferences}
                    onChange={(e) => setEditReferences(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveReferences()}
                    placeholder="e.g. Hans Zimmer, Kendrick Lamar..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors mb-4"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setEditReferences(""); onBriefChange({ ...brief, references_text: "" }); setEditing(null); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveReferences}
                      className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
