# QA scripts (CrazyGames gate)

Playwright scripts used by the crazygames-qa skill. Serve the built upload folder first:
`python3 -m http.server 8767 --bind 127.0.0.1 --directory <dist folder>`

- `technical-gate.cjs` — B=<url> OUT=<dir>: stand-in CrazyGames SDK, screenshots at 821/1080/1216/1280/1920, page/console errors, HTTP >= 400, hosts contacted, first gameplayStart time and SDK event log.
- `new-player-run.cjs` — B=<url> OUT=<dir>: a cleared-storage new player at 1280x720 with 2 s thinking per action (drop-in opening: upgrade with U, then Water and Ice on the glowing spots); logs timestamps, on-screen word counts, first burn and first freeze frames. Warden-specific: adapt per game.
- `small-text.cjs` — B=<url> W=821 H=462 [P=path]: lists every visible text element that renders under 10 px at that window size (accounts for stage scaling).
- `onscreen-words.cjs` — B=<url>: dumps every visible text string on the first screen.

Playwright path is hard-coded for the Claude workspace (/opt/npm-tools/node_modules/playwright); change it to require('playwright') elsewhere.
