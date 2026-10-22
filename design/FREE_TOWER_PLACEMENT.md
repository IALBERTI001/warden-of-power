# Free tower placement

The user requested towers placeable anywhere on the map. The tutorial no longer restricts placement to predefined foundations. Select an element and click a continuous map position. Preview follows the pointer, shows range and a green/elemental or red footprint, and rejects invalid purchases without spending Charge.

Tower footprints must remain within the battlefield, at least 60 world units from the route centerline (road plus footprint), and at least 64 world units from another tower center. These clearances keep the fixed enemy route open; maze construction is not introduced. Existing saved tower positions remain intact. Legacy numeric foundation arguments remain supported internally for old saves/tests, but no foundation markers or preset-placement buttons appear in play.

The command reference includes coordinate entry as a keyboard-accessible alternative. Map-to-screen conversion still accounts for the in-game HUD camera transform. Clicking existing tower artwork selects it when not placing. Right-click/Esc cancels placement.

Engine tests cover arbitrary non-foundation coordinates, overlap, route, non-finite values, map boundaries and no resource loss on rejection. Browser visual QA remains subject to the previously documented file-URL tool restriction.

## Amendment, Oct 22 2026 (user-approved)
"The player can place a tower anywhere in the play area with the exception of on doors or path. Monsters should not be blocked."

- Play area = the open courtyard floor that is visible at every supported window size: engine `PLAY` x 40-960, y 96-505 (the floor below y~505 sits behind the command dock at 1280x720).
- Doorways: blocked only within 26 units of the painted gate frames (`DOORS`), replacing the old 88-unit circle that also blocked large areas of open floor.
- Route: unchanged 60-unit clearance from the centerline (road + tower footprint), so towers can never block or touch the enemy route.
- Towers still cannot overlap each other (64-unit spacing).
- The UI's hard-coded 465 "visible battlefield" limit now uses `E.PLAY.bottom`.
- `tests/coach.test.cjs` checks open-floor spots, doorways, the route, the hidden strip, and that every valid spot leaves the route clear.
