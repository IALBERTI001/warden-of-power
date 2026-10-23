# The Warden's Guide (built Oct 23 2026)

Requested after playtesting combos: "if I was confused then an entry-level player would be too." A built-in, illustrated
handbook ("NewBro guide").

- Opens from the hub top bar (**📖 Guide**), from the battle **Help** dialog (the game pauses while it is open), and from a
  "Read: Combos" nudge on the tutorial results. The hub's first-visit card points to it.
- 10 chapters: Start here · Towers · Combos (Water is the combo builder; Freeze, Conduction, and Shatter as a three-tower
  combo; freeze resistance; how to place for combos) · Statuses · Building and upgrading · Enemies (basic, campaign roles,
  attuned, elites, armour, boss rule) · The hub (Parts, Resonance, Warden Power, restorations, skills, badges, saves) ·
  Ways to play (tutorial, Outer Seal, campaign, finale) · Tips · Controls.
- 23 screenshots captured from the real game with staged states (`game/assets/guide/*.jpg`, ~1.2 MB) plus tower icons from
  the approved sprite sheet. Every number matches the engine at the time of writing.
- Accessibility: a modal dialog, chapter list (a dropdown on phones), Esc closes, 44 px targets, readable serif body text,
  alt text on every picture. Remembers the last chapter you read.
- Files: `game/guide.js`, `game/guide.css`; test `tests/guide.test.cjs`.
