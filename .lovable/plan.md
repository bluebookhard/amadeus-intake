

## Plan: Fix font branding + rework reveal animation

### Font Fix
- The "Here's what we found" text already uses `DM Serif Display` via inline style. Per the style memory, `DM Serif Display` is the correct heading font. The `font-bold` class conflicts with it (DM Serif Display only has one weight). Will switch to `font-normal` and use `font-display` tailwind class instead of inline `style` attributes for consistency.

### Animation Rework
The current flow has the big headline disappear (exit) then reappear inside the card. Instead:

1. **Phase 1 (400ms)**: "Okay..." fades in centered on screen
2. **Phase 2 (1600ms)**: "Okay..." fades out, "Here's what we found" appears large and centered on screen (same position, no card yet)
3. **Phase 3 (3200ms)**: The headline stays visible and animates upward. Simultaneously, the card fades in **behind/around** it — the headline becomes the card header by animating `y` upward. No exit/re-mount of the headline.
4. **Phase 4 (4200ms)**: The rest of the content (summary, recommendation, buttons) fades in below the header.

**Key change**: Instead of using `AnimatePresence` exit on the headline and re-mounting it inside the card, I'll keep a single headline element that persists from phase 2 onward and uses `animate` to transition its position/scale based on `revealPhase`. The card will fade in behind it at phase 3.

### CTA Button
Will change "Score My Video" to "Continue" (neutral, matches the flow).

### Files to edit
- `src/components/ScoreBrief.tsx` — rework animation phases, fix font classes, update CTA text

