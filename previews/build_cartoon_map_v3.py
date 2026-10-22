"""Blend restyle: original map's attractive stonework + cartoon game-art treatment.

Pixel-aligned (nothing moves), so route, gate apertures and portal masks stay valid.
- Fine photographic grain is softened, but stones/joints keep their original shapes.
- Joints get a continuous soft dark-coloured ink (no hard threshold -> no broken lines).
- Object silhouettes (walls, pillars, gates, plants) get a bolder outline.
- Vibrance, not saturation: stone stays stone-grey, copper/teal/foliage get richer.
"""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
K = dict(chroma_even=0.85, desat=0.35, stone_flat=0.5, smooth=3, joint_gain=3.4, joint_max=0.62, sil=0.85, vib=0.75, contrast=1.08)
for a in sys.argv[3:]:
    k, v = a.split('='); K[k] = float(v)

img = cv2.imread(src, cv2.IMREAD_COLOR)

# 1. Soften grain inside stones while keeping their edges.
base = img.copy()
for _ in range(int(K['smooth'])):
    base = cv2.bilateralFilter(base, 9, 28, 6)
base = cv2.edgePreservingFilter(base, flags=cv2.RECURS_FILTER, sigma_s=18, sigma_r=0.16)

flat2 = cv2.edgePreservingFilter(base, flags=cv2.RECURS_FILTER, sigma_s=40, sigma_r=0.10)
base = cv2.addWeighted(base, 1 - K['stone_flat'], flat2, K['stone_flat'], 0)

# 1b. Even out orange/grey camouflage mottling: smooth chroma (not value) on stone.
labc = cv2.cvtColor(base, cv2.COLOR_BGR2LAB).astype(np.float32)
chroma = np.hypot(labc[...,1]-128, labc[...,2]-128)
wst = np.clip(1 - (chroma - 14) / 14, 0, 1) * K['chroma_even']
for c in (1, 2):
    sm = cv2.GaussianBlur(labc[..., c], (0, 0), 14)
    labc[..., c] = labc[..., c] * (1 - wst) + sm * wst
lv = labc[..., 0]; lsm = cv2.GaussianBlur(lv, (0, 0), 3)
labc[..., 0] = lv * (1 - 0.5 * wst) + lsm * 0.5 * wst
base = cv2.cvtColor(np.clip(labc, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)

# 2. Vibrance: boost colour where it already exists (copper, teal, water, moss),
#    leave neutral stone mostly neutral; gentle painted contrast curve.
hsv = cv2.cvtColor(base, cv2.COLOR_BGR2HSV).astype(np.float32)
s = hsv[..., 1] / 255
w = np.clip((s - 0.18) / 0.25, 0, 1)            # only already-coloured areas
hsv[..., 1] = np.clip(s * (1 - K['desat'] * (1 - w)) + K['vib'] * w * s * (1 - s) * 1.6, 0, 1) * 255
v = hsv[..., 2] / 255
v = 0.5 + (v - 0.5) * K['contrast']
v = v + 0.05 * np.sin(np.pi * np.clip(v, 0, 1))
hsv[..., 2] = np.clip(v, 0, 1) * 255
paint = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)

# 3. Continuous joint ink from the ORIGINAL joint structure (soft response, no threshold).
gray = cv2.cvtColor(cv2.bilateralFilter(img, 7, 30, 5), cv2.COLOR_BGR2GRAY)
bh = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT,
                      cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))).astype(np.float32) / 255
bh = cv2.GaussianBlur(bh, (0, 0), 0.8)
joint = np.clip((bh - 0.03) * K['joint_gain'], 0, K['joint_max'])

# 4. Bolder silhouettes for raised objects (walls, pillars, gates, plants, conduits).
edges = cv2.Canny(cv2.GaussianBlur(gray, (0, 0), 2.4), 45, 110).astype(np.float32) / 255
edges = cv2.GaussianBlur(cv2.dilate(edges, np.ones((2, 2), np.uint8)), (0, 0), 0.8)
ink = np.clip(np.maximum(joint, edges * K['sil']), 0, 1)

# Dark *coloured* line like the sprites (darkened, enriched local colour, not black).
hl = cv2.cvtColor(paint.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
hl[..., 1] = np.clip(hl[..., 1] * 1.25 + 28, 0, 255)
hl[..., 2] *= 0.32
line = cv2.cvtColor(hl.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
out = paint * (1 - ink[..., None]) + line * ink[..., None]

# 5. Soft painted form light: slight local-contrast lift so slabs read as chunky.
blur = cv2.GaussianBlur(out, (0, 0), 8)
out = np.clip(out + (out - blur) * 0.18, 0, 255).astype(np.uint8)
cv2.imwrite(dst, out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
print('wrote', dst, K)
