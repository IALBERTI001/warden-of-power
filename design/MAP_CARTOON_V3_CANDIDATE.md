# Broken Conduit map - cartoon blend v3 (CANDIDATE, awaiting review)

Status: review candidate, NOT approved. Approved map remains
`game/assets/broken-conduit-weathered-road-v2.png` and is still the default.

Candidate: `game/assets/broken-conduit-cartoon-v3-candidate.png`
Generator: `previews/build_cartoon_map_v3.py` (OpenCV + NumPy; run on v2 to regenerate)
Comparison: `previews/map-v2-vs-v3-candidate.png`
Preview in game: open `game/index.html?map=v3` (or http://127.0.0.1:8124/game/?map=v3).

Direction (user, Oct 22 2026): liked the game-art feel of a stylized attempt but
preferred the original's attractive stone ground -> asked for a blend.

What it does: pixel-aligned restyle of v2, so layout, route, gate apertures, portal
masks, placement and occlusion are unchanged. Softens photographic grain inside
stones, keeps original stone/joint shapes, adds continuous dark-coloured ink on
joints and bolder silhouettes on walls/pillars/gates/plants, enriches copper/teal/
water/foliage while pulling neutral stone slightly toward grey.

Known limits: it is still a filtered treatment, not a hand repaint. Stones are not
larger/simplified in shape; realistic dappled tree shadow and some warm mottling
remain. A true repaint (image generation) remains an option for a later pass.
All eight test suites pass with the switch in place (default path unchanged).
