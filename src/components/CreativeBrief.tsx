import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreativeBriefData } from "@/types/amadeus";

const ENERGY_OPTIONS = [
  { label: "High Energy", emoji: "⚡", response: "Let's go." },
  { label: "Chill", emoji: "😌", response: "Easy does it." },
  { label: "Emotional", emoji: "🥹", response: "Deep cuts." },
  { label: "Cinematic", emoji: "🎬", response: "Big screen energy." },
  { label: "Playful", emoji: "😄", response: "Keep it fun." },
  { label: "Mysterious", emoji: "🌙", response: "Intriguing." },
  { label: "Romantic", emoji: "🌹", response: "Set the mood." },
  { label: "Rebellious", emoji: "🔥", response: "Break the rules." },
];

const MUSIC_OPTIONS = [
  { label: "Hip Hop", emoji: "🎤", response: "Hard-hitting." },
  { label: "Cinematic", emoji: "🎻", response: "Sweeping." },
  { label: "Lo-Fi", emoji: "☁️", response: "Smooth and slow." },
  { label: "Electronic", emoji: "🎛️", response: "Pure pulse." },
  { label: "Acoustic", emoji: "🎸", response: "Raw and real." },
  { label: "Pop", emoji: "✨", response: "Instant hook." },
  { label: "Jazz", emoji: "🎷", response: "Cool and complex." },
  { label: "Ambient", emoji: "🌊", response: "Wide open spaces." },
];

type Step = 0 | 1 | 2;

interface Props {
  onComplete: (brief: CreativeBriefData) => void;
}

export default function CreativeBrief({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [references, setReferences] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [responseLine, setResponseLine] = useState("");
  const [confirmedAnswers, setConfirmedAnswers] = useState<{ label: string; emoji: string }[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [flashOut, setFlashOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const advanceAfterResponse = useCallback((answer: { label: string; emoji: string }, response: string, nextStep: Step) => {
    setShowResponse(true);
    setResponseLine(response);
    setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        setConfirmedAnswers((prev) => [...prev, answer]);
        setShowResponse(false);
        setTransitioning(false);
        setStep(nextStep);
      }, 400);
    }, 800);
  }, []);

  const handleEnergySelect = useCallback((opt: typeof ENERGY_OPTIONS[0]) => {
    setSelectedEnergy(opt.label);
    advanceAfterResponse({ label: opt.label, emoji: opt.emoji }, opt.response, 1);
  }, [advanceAfterResponse]);

  const handleMusicSelect = useCallback((opt: typeof MUSIC_OPTIONS[0]) => {
    setSelectedMusic(opt.label);
    advanceAfterResponse({ label: opt.label, emoji: opt.emoji }, opt.response, 2);
  }, [advanceAfterResponse]);

  const submitBrief = useCallback((refText: string) => {
    setFlashOut(true);
    setTimeout(() => {
      onComplete({
        overall_energy: selectedEnergy!,
        music_style_direction: selectedMusic!,
        references_text: refText,
      });
    }, 500);
  }, [selectedEnergy, selectedMusic, onComplete]);

  const handleReferencesSubmit = useCallback(() => {
    submitBrief(references);
  }, [references, submitBrief]);

  const handleSkip = useCallback(() => {
    submitBrief("");
  }, [submitBrief]);

  useEffect(() => {
    if (step === 2 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const questions: Record<Step, { emoji: string; text: string }> = {
    0: { emoji: "🔥", text: "What's the energy of your video?" },
    1: { emoji: "🎵", text: "What kind of music fits the vibe?" },
    2: { emoji: "✨", text: "Any artists or tracks for inspiration?" },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: flashOut ? 0 : 1 }}
      transition={{ duration: flashOut ? 0.3 : 0.4 }}
    >
      {/* Confirmed pills */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
        <AnimatePresence>
          {confirmedAnswers.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.5, y: 0 }}
              className="px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground flex items-center gap-1.5"
            >
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Question area */}
      <div className="w-full max-w-xl px-8">
        <AnimatePresence mode="wait">
          {!transitioning && (
            <motion.div
              key={step}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {/* Emoji */}
              <motion.span className="text-5xl mb-6">{questions[step].emoji}</motion.span>

              {/* Question or Response line */}
              <AnimatePresence mode="wait">
                {showResponse ? (
                  <motion.p
                    key="response"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-primary text-center mb-10"
                  >
                    {responseLine}
                  </motion.p>
                ) : (
                  <motion.h2
                    key="question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-foreground text-center mb-10"
                  >
                    {questions[step].text}
                  </motion.h2>
                )}
              </AnimatePresence>

              {/* Chips for Q1 and Q2 */}
              {step === 0 && !showResponse && (
                <ChipGrid
                  options={ENERGY_OPTIONS}
                  selected={selectedEnergy}
                  onSelect={handleEnergySelect}
                />
              )}
              {step === 1 && !showResponse && (
                <ChipGrid
                  options={MUSIC_OPTIONS}
                  selected={selectedMusic}
                  onSelect={handleMusicSelect}
                />
              )}

              {/* Text input for Q3 */}
              {step === 2 && (
                <div className="w-full flex flex-col items-center gap-4">
                  <input
                    ref={inputRef}
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && references.trim() && handleReferencesSubmit()}
                    placeholder="e.g. Hans Zimmer, Kendrick Lamar..."
                    className="w-full bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex items-center gap-6">
                    {references.trim() && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleReferencesSubmit}
                        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                      >
                        Score My Video ✦
                      </motion.button>
                    )}
                    <button
                      onClick={handleSkip}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface ChipGridProps {
  options: { label: string; emoji: string; response: string }[];
  selected: string | null;
  onSelect: (opt: { label: string; emoji: string; response: string }) => void;
}

function ChipGrid({ options, selected, onSelect }: ChipGridProps) {
  return (
    <motion.div className="grid grid-cols-4 gap-3 w-full">
      {options.map((opt) => {
        const isSelected = selected === opt.label;
        const isOther = selected !== null && !isSelected;
        return (
          <motion.button
            key={opt.label}
            onClick={() => !selected && onSelect(opt)}
            animate={{
              opacity: isOther ? 0 : 1,
              scale: isSelected ? 1.06 : 1,
            }}
            transition={{ duration: 0.2, type: isSelected ? "spring" : "tween", stiffness: 300, damping: 20 }}
            className={`chip justify-center text-center ${isSelected ? "chip-selected" : ""}`}
            disabled={!!selected}
          >
            <span>{opt.emoji}</span>
            <span>{opt.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
