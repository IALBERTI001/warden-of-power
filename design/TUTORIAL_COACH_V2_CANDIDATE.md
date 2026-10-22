# In-world tutorial ("coach") v2 — REVIEW CANDIDATE

Status: directions A–G approved by the user Oct 22 2026; this implementation awaits visual/playtest review.
Default game is unchanged. Preview: `game/index.html?tutorial=v2` (combine with `&map=v3` for the map candidate).

Files: `game/coach.js`, `game/coach.css`, hooks in `game/game.js` (guarded; no-ops without the flag), test `tests/coach.test.cjs`.
Proposal and mockups: `design/TUTORIAL_LOOK_AND_FEEL_PROPOSAL.md`, `previews/tutorial-mock-*.png`. Real screenshots: `previews/tutorial-v2-*.png`.

What it does
- A. Objective tracker (top-left): lesson per wave, goals tick from real actions (Guide state), 5 wave pips. Compact under 1350px, hidden under 600px; fades when a tower/build spot is beneath it.
- B. Anchored Warden callout: one short instruction pointing at the exact spot/control (build spot, tower, Upgrade, Target, Sell, element card, Begin wave). Dismissable (×). Hidden during combat steps.
- C. Suggested build spot: pulsing rune ring, faint ghost Fire tower and range ring. It is only a suggestion: building is allowed anywhere on open floor.
- D. Wave briefing card before each wave (only when no enemies are on the route): title, one-line goal, combo recipe drawn with real tower art, enemy preview. "Let's build" closes it; it never starts a wave.
- E. First real Freeze / Chain / Shatter: big cartoon word pop, 0.9s slow-motion (off with Reduced motion), explanatory toast. Toasts restyled in plum/brass.
- F. Handbook: same behaviour (all 14 pages, free paging, remembers page, Show me never transacts, nonmodal, Esc closes) but closed by default and restyled as a painted tome docked right.
- G. Sentences use a readable serif (Palatino Linotype / Book Antiqua / Georgia system fonts); Warden Quill stays for titles, labels, numbers.

Bug fixes (apply to both tutorials)
- Pressing the hotkey/card of the already-selected element no longer cancels placement (Fire starts selected; following "press 1" used to cancel). Cancel = Esc / right-click.
- "PLACE FIRE HERE" / "SELECT THIS TOWER" canvas markers disappear once the action is done, not when the page is turned.

Never does: buy, upgrade, sell, retarget or start waves for the player. All mechanics, numbers, five waves, unlocks, target badges unchanged.

Verification (Oct 22 2026): 9 Node suites pass. Headless Chromium (Playwright) playthrough at 1440x900 and 1280x720: intro cards before waves 1–5, each Wave-1 step's callout anchors correctly, first freeze/chain/shatter celebrations fire, 5/5 victory, no page errors. Not yet: real-device, touch, audio feel, user playtest.
