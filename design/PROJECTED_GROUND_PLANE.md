# Shared ground plane and dimensional road

The user rejected the flat route overlay because it conflicted with the dimensional courtyard background. The renderer now uses a shared oblique ground projection for road geometry, tower/enemy foot positions, ground indicators, effects/projectiles and hit testing. Sprites remain upright billboards; their approved artwork is not stretched by the ground matrix. Rendering sorts units by projected foot depth.

The broad flat stripe is removed. A cached mesh of individual stone slabs follows the existing simulation route. Each slab has a lit upper edge, shaded exposed faces, a shallow height, fine seams and contact shadows. Colors are chosen to sit within the existing stone courtyard. Tower contact shadows establish grounding.

This is a **2.5D presentation**, not a conversion to a WebGL scene with camera-orbitable 3D models. Its purpose is a coherent dimensional look using the approved painted sprites. Camera angles are artistically approximated from the existing background, not recovered/calibrated from 3D scene data; user visual review is still required. No claim of verified visual alignment is made without browser inspection.

Combat coordinates, collision distances, wave rules and saved tower coordinates stay in their original world space. An inverse transform converts placement and selection input. UI placement additionally rejects points hidden beneath the command dock. Engine regression, mocked-UI and projection/road-mesh tests run independently of visual review.
