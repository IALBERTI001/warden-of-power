# Enemy death sequences — review 02

Death treatments pending user approval. Movement treatments from review 01 are approved.

The reference remains `art-reference/approved-elemental-sprites-v1.png`. New pose atlas: `art-reference/enemy-death-candidates-v1.png`.

Built-in image generation prompt: preserve the reference identities, proportions, camera, light, materials and palettes; produce six chronological non-looping death poses per enemy on a transparent 6-by-3 atlas. Slime recoils and collapses to a green puddle with fallen sprout; beetle legs buckle and curl as its original orange shell settles on its side; golem knees buckle and moss-covered boulders collapse into a pile with the spiral forearm stone retained. Non-graphic defeat, no new characters, accessories or design changes.

Preview: `previews/enemy-deaths-v1.gif`, assembled by `previews/build_death_preview.py`. It shows an alive hold, the successive collapse poses, a final pose hold, and cleanup fade, then resets for review. Both enlarged and gameplay-size views use the same poses. This is a preview of one-shot deaths, not an endlessly repeating in-game death animation.

The generated frames are candidates based on the approved art; production still requires consistency and registration cleanup, and seamless transitions from the final movement pose into death. The golem face and individual rocks have some generated detail variation; do not mistake this for authorization to redesign the character. Boss death and elemental-specific defeat variations are outside this sample.

Implementation contract: entering death stops movement and targeting, disables collisions appropriate to defeated enemies, awards rewards once, plays the sequence once, then removes the corpse after cleanup. Dead enemies cannot damage the base, receive repeated kill credit, or be selected by new tower attacks. Any combo effects already in flight must resolve without duplicating death events. Gameplay pause and speed controls should govern animation time consistently. These are design requirements, not implemented game logic.
