# Art tools

- `layout.py`: level layout geometry (road centre line with fillet arcs of one radius; game path export).
- `kit_road.py`: road from building blocks: quilted cobble fill + individually placed kerb stones lit toward the light, mortar bed, contact shadow.
- `kit_build.py`: builds a map from `levels/<id>.json`, the painted ground and the kits in `art/kits/` (writes the map image, the gameplay data and a debug overlay).
- `road.py`: older single-strip road renderer (kept for reference; superseded by kit_road.py).
- `stitch.py`: joins browser capture tiles back into one image, registering each tile on its overlap and reporting the match error.

## Getting a generated image out of the browser (no downloads needed)
1. In the ChatGPT tab, draw the generated image onto a canvas fixed at the top-left of the page, sized so ONE image pixel
   = ONE screenshot pixel. The browser's screenshot scale is not always devicePixelRatio: calibrate first by drawing a
   grid with labelled lines every 100 px and checking that lines land 100 screenshot px apart (Oct 29: needed CSS size =
   image size / 1.5625 at devicePixelRatio 1.25).
2. Capture with full screenshots, not zooms (a zoom can return the previous frame). Wait ~1.5 s after moving the canvas.
3. Tiles: offsets (0,0), (W-772,0), (0,H-984), (W-772,H-984) for a 772x984 screenshot.
4. Stitch with `stitch.py out.png W H x,y:tile ...`; it registers every tile on its overlap. Every tile's error must be
   under 10 and coverage 1.0, or recapture.
