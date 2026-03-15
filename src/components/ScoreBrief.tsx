import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, ChevronLeft } from "lucide-react";
import type { CreativeBriefData } from "@/types/amadeus";

interface Props {
  brief: CreativeBriefData;
  clipCount: number;
  onEditQuestion: (step: number) => void;
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

function getNarrative(brief: CreativeBriefData): string {
  const ref = brief.references_text?.trim();
  if (ref) {
    return `Think ${ref}-inspired ${brief.music_style_direction}. Your footage sets the tempo.`;
  }
  return `We'll compose a ${brief.music_style_direction} ${brief.overall_energy.toLowerCase()} score — built to move with your story.`;
}

export default function ScoreBrief({ brief, clipCount, onEditQuestion, onContinue, onReanalyse, onBack }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [flashOut, setFlashOut] = useState(false);

  const handleContinue = useCallback(() => {
    setFlashOut(true);
    setTimeout(onContinue, 400);
  }, [onContinue]);

  const handleReanalyse = useCallback(() => {
    setShowConfirm(true);
  }, []);

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

  // Mocked stats
  const cuts = 87 + clipCount * 40;
  const runtime = `~${Math.floor((clipCount * 38) / 60)}m ${(clipCount * 38) % 60}s`;
  const scenes = Math.max(2, clipCount + 1);

  const cards = [
    { icon: ENERGY_EMOJI[brief.overall_energy] || "⚡", value: brief.overall_energy, label: "Your energy", step: 0 },
    { icon: "🎵", value: brief.music_style_direction, label: "Your style", step: 1 },
    { icon: "✨", value: brief.references_text?.trim() || "—", label: "Inspiration", step: 2 },
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
        className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-auto py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: flashOut ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-full max-w-[640px] bg-card border border-border rounded-[20px] p-8 md:p-10"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">
            {/* AI Read headline */}
            <motion.div variants={fadeUp} className="text-center">
              <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-primary mb-4">
                Based on your video
              </p>
              <p className="text-lg md:text-xl font-bold text-foreground">
                ↑ <AnimatedNumber target={cuts} /> cuts detected · {runtime} runtime · <AnimatedNumber target={scenes} /> scenes identified
              </p>
            </motion.div>

            {/* Selection cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
              {cards.map((card) => (
                <motion.div
                  key={card.label}
                  className="relative bg-background border border-border rounded-xl p-4 flex flex-col items-center gap-2 group"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-sm font-semibold text-foreground text-center truncate w-full">{card.value}</span>
                  <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <button
                    onClick={() => onEditQuestion(card.step)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* AI Narrative */}
            <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground italic">
              "{getNarrative(brief)}"
            </motion.p>

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
                    <p className="text-xs text-muted-foreground">Re-analysing will reset your selections. Continue?</p>
                    <div className="flex gap-4">
                      <button onClick={confirmReanalyse} className="text-xs text-primary hover:underline">
                        Yes, re-analyse
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
                    onClick={handleReanalyse}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Something's off — re-analyse
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
