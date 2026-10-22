# Tutorial revision — October 21, 2026

Supersedes the eight-wave tutorial and enemy reticle teaching in earlier notes.

Every built tower displays its targeting priority above its artwork: arrow/1 for First, reversed arrow/1 for Last, flexed arm for Strongest, bullseye for Nearest. The inspector and field manual explain their meanings. Badges indicate policy, including while idle. Removed the rendered tower shadow and enemy focus line/reticle.

Show me highlights the lesson control or tower command panel; it never sells, upgrades, or opens a transaction. Sell is an informational lesson with an explicit Understood button. Actual sale remains optional and confirmed. Upgrade hotkey highlights the upgrade for review.

Five waves: Fire & burning; Water + Ice; Lightning/conduction; Fire + Ice shatter; combined defense. Water and Ice unlock after wave 1 clears, Lightning after wave 2. Wave 1 gives 140 preparation Charge, wave 2 gives 90, later clears 45, in addition to enemy rewards. Teaching golems have 1.35× health in waves 2/4 to allow combinations to develop. These values are tutorial tuning, not a campaign balance change.

Water deals light damage and applies Soaked (4 seconds at Tier I); Soaked alone does not slow. Ice chills for 2.7 seconds, slowing 24% at Tier I. Ice consumes Soaked to freeze for 1.5 seconds; thaw grants 4 seconds of resistance. Fire shatters frozen targets, shortening resistance to 2 seconds. Lightning conducts from Soaked into nearby enemies. First actual occurrences show explanatory notices, with permanent reference text in the field manual and tower inspector. Awards require real simulation events.

Old eight-wave in-progress runs restart this revised practice course. Saved badges and banked Parts remain. New saves carry tutorialVersion 3.

Validation: engine and UI integration tests, including a complete five-wave simulated beginner defense with all three real combinations and no extra upgrades beyond the required first upgrade. Browser visual review remains outstanding.

## Closable handbook

Tutorial reading now uses a parchment book with 14 independently browsable pages. Previous/Next do not require completing actions and do not award accomplishments. A persistent Warden’s Handbook button opens/closes it; close and Escape preserve the current page, which is stored in settings. The book is a nonmodal overlay: waves keep flowing. Reading no longer blocks wave one. Show me closes the book and highlights the relevant battlefield control; opening/turning/closing the book clears that spotlight. Restart returns to page one. Combat/achievement state remains separate from reading position.

Validated open/close, retained reading position, Previous/Next, first/last boundaries, and Show me without transactions in the UI smoke test. All eight suites pass; browser visual review remains outstanding.
