# Battlefield-first interface revision

The user rejected the first tutorial interface as generic and website-like. That layout is not an approved reference. Existing art and gameplay approvals are unaffected.

The implementation now occupies a single viewport-sized, aspect-preserving game stage. The map is the primary surface, rather than a card in a website. No permanent external side column, web header, footer, or controls section remains.

- Resources are a compact in-game top plaque, with achievements, commands and the settings gear at the top edge.
- Tower artwork is displayed in a brass-trimmed bottom command dock alongside wave and speed controls.
- Tutorial guidance is a dismissible in-world overlay.
- Selecting a tower/enemy opens a contextual inspector. It moves to the opposite edge for right-side selections, can be closed, and is absent otherwise. Target selectors and keyboard-focused upgrade buttons are no longer replaced on every HUD refresh.
- Help contains the command reference, accessible foundation controls, and development art review entry. Development status text is removed from the active battlefield.
- Settings, confirmations, achievements and results remain game overlays, with pause state preserved as before.
- The world-to-screen transform leaves space for the dock and is inverted for pointer hit testing. Original combat coordinates, cooldowns, ranges, waves, art and save data are unchanged.

This is a new UI candidate, not implicitly approved. Automated engine and mocked-UI checks pass; they do not validate appearance. Browser tools rejected observing the user's existing file:// tab under their HTTP/HTTPS-only URL policy. No alternate UI surface or policy workaround was attempted. Actual browser visual QA remains pending; the user can reload the existing game file to inspect it.
