# Campaign sector arenas (v1, Nov 4 2026)

Approved plan "one look for the whole game" (Nov 4 2026): every campaign map is rebuilt in layers on a sector arena that is a
repaint of the approved Outer Seal, so all maps share one frame, wall, channel, courtyard, seal, camera, scale and light.

Made by Claude in ChatGPT (the user's built-in browser), with `game/assets/maps/outer-seal.jpg` attached as the reference.
Captured at 1.5x in 800x600 screenshot tiles, assembled at exact offsets (`assemble.py`, overlap required between every
column) and downscaled, so no JPEG noise is left. Outputs: `art/incoming/<sector>-arena_v1_20261104.png` and the game
ground `art/ground/<sector>/arena_v1.png` (1620x971).

## Prompt template (one per sector; only the element lines change)
```
Create an image. Painted cartoon fantasy, three-quarter top-down camera, chunky readable shapes with dark coloured outlines,
rich elemental colours, warm golden light from the upper left, clean flat play areas with detail kept to the borders.
Repaint the attached tower-defense map as its <ELEMENT> sector version (<SECTOR NAME>), keeping EXACTLY the same composition,
camera, scale, brightness and painting style: the same thin border along the top, left and bottom edges, the same vertical
channel at the same place on the right, the same paved courtyard strip at the far right, the same low wall with orb-topped
pillars along the top of the field, and the same round glowing seal with four orb pillars in the courtyard. Changes: remove
the road and the bridge completely, so the whole field is open and even. The field is <FIELD>, calm and flat, as bright as the
original meadow, with fine even detail at the same size as the original grass. The border is thin: <BORDER>. The channel is
<CHANNEL>. The orbs and the seal glow <COLOUR>, and the seal shows a <RUNE> rune. Same landscape shape as the attached image.
Do not include: text, letters, numbers, logos, watermarks, frames, characters, monsters, towers, user interface,
photorealism, any road or path.
```

| Sector | Field | Border | Channel | Glow / rune |
|---|---|---|---|---|
| Moonwell (water) | short blue-green moss lawn with tiny white flowers and a few scattered pale old flagstones | reeds, ferns and small mossy rocks | clear turquoise water with lily pads | turquoise-blue, crescent moon |
| Emberheart (fire) | warm sunlit volcanic ground: fine reddish-brown ash and small worn basalt and sandstone pebbles, a few thin softly glowing ember cracks | dark basalt rocks with small glowing lava cracks and a few charred shrubs | a glowing orange lava stream | fiery orange, flame |
| Rimeglass (ice) | fresh sunlit packed snow with soft pale-blue frost patches and a few small icy pebbles, bright but not pure white | snow-covered rocks, small blue ice crystals and a few frosted pine shrubs | a frozen pale-blue ice stream with cracks | icy cyan, snowflake |
| Stormcrown (lightning) | a sunlit high mountain plateau of short silver-green grass and purple heather with a few small grey slate pebbles | grey slate rocks with small glowing violet crystals | a deep narrow chasm with violet storm clouds and tiny lightning sparks far below | violet, lightning bolt |

Tried and rejected for Moonwell: large cistern flagstones (4x the texel size of the Outer Seal grass) and cobble-size
flagstones (busy, the road got lost in it).

Lesson: ChatGPT keeps an unsent draft in every open tab, so prompts typed into several tabs at once merge. Send one tab at
a time and clear the box first.
