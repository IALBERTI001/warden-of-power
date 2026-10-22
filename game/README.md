# Warden of Power — playable tutorial, development build 01

Open `index.html` in a browser. Keep `game`, `art-reference` and `previews/audio-v2` and `previews/audio-v3` in their existing relative locations. No install, account, build command or network connection is required for the tutorial. Alternatively serve the repository root with `python -m http.server 8124 --bind 127.0.0.1` and visit `http://127.0.0.1:8124/game/`.

## Play

Choose Fire or press 1, then click a foundation. Begin a wave when ready. Other elements unlock as the tutorial advances. Select towers by clicking their artwork or foundations. Upgrade from the inspector, change targeting, and sell with confirmation. All orders work in real time or while paused.

Defaults: 1 fire, 2 water, 3 ice, 4 lightning; U focuses upgrades; X opens sell confirmation; T cycles targeting; Space pauses; N starts/requests the next wave; Z/C/V select 1x/2x/5x. Settings allow remapping. Right click or Esc cancels placement. Accessible foundation buttons sit below the battlefield.

This contains five tutorial waves: Fire, Water + Ice, Lightning conduction, Fire + Ice shatter, and the combined defense. Build/upgrade/sell, targeting, normal/chilled/frozen/soaked/burning states, conduction, shatter, death cycles, local achievements, settings, sound effects, speed, win/loss, local profile and resumable local runs are connected.

## Approval boundaries

Approved Tier I artwork is used unchanged. Water Tier II / both Tier III forms and the other three elements' upgraded sprites are newly generated **review candidates**. The courtyard background is also a review candidate. Water changes plumbing/nozzles; fire changes vents/burst nozzle; ice changes crown; lightning changes electrodes/focusing core. Inspect them with Review tower tiers. No approval of these new sprites is assumed.

Background generation prompt: a near-top-down painted overgrown elemental containment courtyard, copper conduits and water channel, quiet central terrain, left gateway, right containment mechanism, no pre-existing road/pads/characters/UI. The playable road and foundations are drawn by the game. Tower-generation prompts preserve the base designs and add the approved tier/specialization concepts; final review is still required. Images generated with the built-in image tool, copied into `assets/`.

Approved v3 elemental sound effects are connected for all four towers, with varied launches/contacts and limited overlap at every game speed. The optional map-music study is not approved final music and starts muted. Ambience has a settings channel but no authored track yet.

## Persistence

Profile, settings and a current attempt use versioned browser localStorage, with error handling. Badges and banked Restoration Parts survive restart. This is explicitly local persistence, not CrazyGames account integration or online leaderboard support. Moving between file and HTTP URLs can use different browser storage origins. Keep using one origin to resume the same save.

## Verification

Run `node tests/engine.test.cjs` and `node tests/tutorial-smoke.cjs` from the repository root. Engine tests cover build/refund rules, upgrades without resetting cooldowns, specialization choice, no repeated freeze extension, soaked consumption, 4s thaw and 2s shatter resistance, boss resistance, conduction, single death rewards, projectile snapshots, and equivalent outcomes at 1x/2x/5x. The smoke test covers UI initialization/actions/render calls with a mocked DOM, not actual browser rendering or sound listening.

A scripted eight-wave run using ordinary resource constraints won with the seal intact in approximately 291 simulation seconds and triggered 53 freezes, 12 conductions and 14 shatters. This proves a completion path, not player-tested balance. Additional tests and playtesting should cover weak builds, lost attempts, resumes, and device performance.

An automated in-app browser attempt to reach the local HTTP server timed out. Actual visual, input, audio and responsive browser QA have **not** passed; do not describe this as a verified browser release. The local file is provided for the user's review.

## Remaining production work

Map/tier-art approval and atlas alignment cleanup; proper directional enemy turn frames; final badge art; fire/lightning and ambience audio; approved seamless music; deeper guided lesson reactions; campaign/restoration, skill tree/endless and online services; platform SDK and submission QA. Subsequent game work should preserve the approved identities, timings and player-first philosophy. The tutorial is a playable starting point, not a finished/published game.


All displayed tutorial wave totals derive from engine WAVES through waveProgress(). Handbook reference-page numbering is separate from wave progress. The game now uses the original bundled Warden Quill font for UI and battlefield text. It replaces the pending Quite Magical integration at the player's request. Build source: previews/build_warden_font.py. Font notes: game/assets/fonts/README.md. No external font dependency is required.
