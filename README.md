# Warden of Power

A polished browser tower-defense game in active development. You are the Warden of Power, defending an ancient elemental containment complex with Fire, Water, Ice and Lightning towers and their combinations.

**Philosophy:** players are the life-blood of our games. Our focus is the player and their experience.

## Play locally
Serve the whole project root (not just `game/`), then open the game:

```
py -m http.server 8124 --bind 127.0.0.1
```
http://127.0.0.1:8124/game/

## Tests
```
for f in tests/*.cjs; do node "$f"; done
```
Balance simulator: `node tools/simulate.cjs [--profile file.json] [--json]`

## Where things are
- `game/` — the game (plain HTML/CSS/JS, no build step)
- `art-reference/` — approved sprite sheets
- `design/` — decision records; `design/APPROVALS_2026-10-22.md` lists the latest approvals
- `previews/` — review images, art briefs, asset generators
- `PROJECT_HANDOFF.txt`, `ART_DIRECTION.md` — project context and art rules
