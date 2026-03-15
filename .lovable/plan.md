

## Fix: Remove duplicate "Here's what we found" and simplify animation

### Problem
"Here's what we found" renders twice:
1. As a standalone `motion.h2` during phase 2–3 (lines 143–156)
2. As a static `h2` inside the card from phase 3 onward (lines 169–173)

This causes the text to visually appear twice during the transition.

### Solution
Simplify to a clean 3-phase sequence with only ONE instance of the headline:

1. **Phase 1** (0.4s): "Okay..." fades in centered, fades out
2. **Phase 2** (1.6s): "Here's what we found" fades in slowly, centered, clean background — **stays visible**
3. **Phase 3** (3.6s): The card fades in around the headline. Remove the standalone phase-2 headline (it exits). The card already contains the headline as its header. Use `mode="wait"` on AnimatePresence so the standalone exits before the card enters, preventing overlap.

### Changes to `ScoreBrief.tsx`
- Remove the standalone phase 2 `motion.h2` block (lines 142–156)
- Instead, show the card starting at phase 2 but only reveal content at phase 3:
  - Phase 2: Card appears with just the headline (no border/bg yet — or use a simple fade)
  - Phase 3: Card content fades in
- **Simpler approach**: Keep a single `AnimatePresence mode="wait"` wrapper. Phase 1 shows "Okay...", phase 2+ shows the card. The card fades in with just the headline visible first, then content appears at phase 3. No duplicate text.
- Reduce total phases from 5 to 3 for snappier feel
- Adjust timings: phase 1 at 400ms, phase 2 at 1800ms, phase 3 at 3000ms

