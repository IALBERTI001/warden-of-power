# Tutorial look & feel — proposal (NOT approved; for review)

Date: Oct 22, 2026. Mockups: `previews/tutorial-mock-a-build.png`, `previews/tutorial-mock-b-wave.png`
(rendered on the live game with the v3 map candidate; overlays are mock-only, no game code changed).

## What the current tutorial does that works against the player
1. **The handbook covers the battlefield.** A beige 14-page "reference" card sits dead centre, over the road and the build spot it is teaching about.
2. **It reads like documentation, not a game.** Page counts, "Reference pages", Previous/Next, Skip lesson. The player reads instead of plays.
3. **Style clash.** Flat beige web dialog + plain buttons vs. the painted cartoon world and the plum/brass HUD.
4. **Weak in-world guidance.** "PLACE FIRE HERE" is a thin ellipse with small white text; no ghost tower or range preview.
5. **Bug-level issues found while testing:**
   - Fire is pre-selected, so following the instruction "press 1 / select Fire" *cancels* placement ("Placement canceled").
   - The "PLACE FIRE HERE" marker follows the book page, not the action: it stays on the map after the Fire tower is built until the player turns the page.
6. **Text duplicated** in three places (book, bottom feedback bar, wave panel).
7. Small body text in Warden Quill is hard to read at paragraph length (mixed capital-looking glyphs: "marKeD BenD").
8. Toasts ("Badge unlocked") are plain web boxes; key moments (first freeze, shatter, chain) have no celebration.

## Proposed direction: teach in the world, one action at a time
A. **Objective tracker** (top-left, compact, painted plum/brass panel): current wave lesson, 2–4 checkable goals that tick off from *real* actions, 5 wave pips.
B. **Anchored Warden callout**: short speech panel pointing at the exact place/control, 1–2 sentences, auto-advances when the action happens. Never covers the road or the target.
C. **In-world build spot**: glowing rune ring + translucent ghost of the tower + range preview touching the road; dock card pulses.
D. **Wave intro card** before each new lesson wave: title, one-line goal, combo recipe drawn with the real tower sprites (Water + Ice = FREEZE), enemy preview, Ready [N].
E. **Celebrate real combos**: on first real freeze/shatter/conduct, brief slow-mo + cartoon word pop ("FROZEN!") + badge toast in the game's panel style.
F. **Handbook stays** (approved behaviour preserved: always available, free paging, remembers position, Show me never transacts, nonmodal) but becomes an optional reference opened from its button, not the primary teacher; restyled as a painted tome.
G. **Typography**: Warden Quill for titles, labels, numbers; a legible companion serif for sentences (needs your approval — changes approved typography use).

## Preserved / unchanged
Five waves, unlock order, all mechanics & numbers, above-tower target badges, pause/speeds/hotkeys, approved art, sounds and font.

## Open questions for the user
- Approve direction A–F? Approve G (companion body font)?
- Should the tutorial gently pause for the wave-intro card (it already happens between waves) — yes/no?
