# Real-time tutorial implementation baseline

The user approved real-time build/upgrade/sell/targeting, preparation windows, partial refunds, an unused-tower undo, and hotkeys. Tower progression has three tiers with a Tier III specialization choice. See `game/README.md` for implementation, tests and remaining work.

Current tutorial costs are tuning values, not approved final economy: fire 60, water 65, ice 75, lightning 90 Charge; starting Charge 165; wave-clear bonus 45; kill rewards by role. Sell returns 75% of total invested; an unused tower returns its full investment. Purchasing upgrades does not reset cooldowns or mutate in-flight projectiles. A tower starts with a full cooldown, preventing free-shot buy/sell cycling.

Three tiers are functional for all elements. Tier II enhances damage, range and rate. Tier III options are Wildfire/Fracture furnace, Deluge/Pressure Lance, Cold front/Crystal focus, Chain reaction/Focused current. Names, exact numbers and candidate upgrade artwork still need review. The base identities remain unchanged. The tutorial remains playable without committing to those final art approvals.

New map: The Broken Conduit, an overgrown containment courtyard. It supersedes the garden-specific First Watch description for this implementation. The player is Warden of Power, protecting the outer seal from elemental manifestations. The scripted boss is a larger corrupted stone caretaker until a separate boss animation set exists.

Newly completed code is not a substitute for user playtesting. Preserve the difference between model/unit checks, mocked UI checks, and real browser checks. The latter was blocked by a local HTTP timeout during this turn.
