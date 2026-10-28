# Outer Seal ("First Watch") repaint: brief and prompt (v2, Oct 28 2026)

Approved by the user on Oct 28 2026 (rules check item 2). The first map a new player sees must be one of the best-looking screens; a fresh-eyes reviewer rated the current painting the weakest of the 14 maps (open grass, no border, no glowing objective, noisy ground).

## Brief
- **Purpose:** the first battlefield of the game (tutorial and Outer Seal levels). In half a second a player must read: monsters come from the forest on the left, walk the road, and must not reach the glowing seal gate on the right.
- **Layout:** exactly the current road. Paint over `art/guides/outer-seal-guide.png` 1:1 (same road path and width, the bridge and the gate in the same places). The game's routes are traced from this layout.
- **Size:** 1620 x 971 pixels. Shown up to about 1800 px wide, so detail must hold up close.
- **What changes:**
  - Frame the meadow like the other maps' arenas: low ruined outer-wall segments, ward stones and an old stone kerb along the top and bottom edges, the dark forest only at the left entrance.
  - Make the objective glow: the Outer Seal gate on the right gets a bright turquoise rune seal on its doors, like the seals on the campaign maps.
  - Calm the ground: short, even grass with a few soft colour patches and old flagstones; no busy high-contrast noise. Keep the build floor flat and open.
  - Give the road a clear edge (kerb stones), so it reads against the grass.
- **Keep:** the forest entrance on the left, the moat and stone bridge, the fortress wall and gate on the right, warm light from the upper left.
- **Avoid:** text, letters, numbers, logos, watermarks, borders or frames, characters, monsters, towers, UI, photorealism.

## Attach these images (from the Online Games\art folder)
1. `art\guides\outer-seal-guide.png` (the layout to paint over)
2. `art\reference\map-arena-example-emberheart.jpg` and `art\reference\map-arena-example-moonwell.jpg` (the standard to match)
3. `game\assets\maps\outer-seal.jpg` (the current painting, for the gate, bridge and moat)

## Prompt (paste as is)
```
Painted cartoon fantasy, three-quarter top-down camera, chunky readable shapes with dark coloured outlines, rich elemental colours, warm golden light from the upper left, clean flat play areas with detail kept to the borders.
A tower-defense battlefield outside the south gate of a magical fortress. Paint over the attached layout guide exactly: the tan road must keep exactly the same path, width and curves, crossing the stone bridge over the blue moat and ending at the great gate on the right. Monsters enter from a dark forest at the left edge.
Make it an arena like the attached Emberheart and Moonwell maps: low ruined wall segments, ward stones and an old stone kerb frame the top and bottom edges; the light green meadow inside is calm, short, even grass with a few old flagstones, flat and open with no trees, rocks or buildings on it. The road has clear kerb stones on both sides. The gate on the right has a bright turquoise glowing rune seal on its doors.
Colours: meadow greens, warm stone, turquoise water #65d5df, gold trim #bd9756.
Exactly 1620 x 971 pixels. Match the style of the attached reference maps exactly.
Do not include: text, letters, numbers, logos, watermarks, frames or borders, characters, monsters, towers, user interface, photorealism.
```

## After painting
Save it as `art\incoming\outer-seal_v2_<yyyymmdd>.png` in the Online Games folder and tell Claude. Claude then checks it against the layout, runs the consistency check and adds it to the approvals doc for your tick.
