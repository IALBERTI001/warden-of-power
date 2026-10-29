"""Shared geometry for kit layouts (levels/<id>.json): road centre line with fillet arcs, sampling, masks.

The road is a polyline of straight runs joined by 90-degree (or any-angle) fillet arcs of ONE radius. The same centre line
is the enemy route in the game, the axis of the drawn road and the axis of the no-build zone.
"""
import json, math
import numpy as np


def load(path):
    return json.load(open(path))


def fillet_path(points, r, step=2.0):
    """Polyline with every inner corner rounded by an arc of radius r; returns dense points (list of (x, y)) and
    a list of pieces [('straight', p0, p1) | ('arc', centre, a0, a1, r)] for the builder."""
    P = [np.array(p, float) for p in points]
    pieces, cur = [], P[0]
    for i in range(1, len(P) - 1):
        a, b, c = P[i - 1], P[i], P[i + 1]
        u = (a - b) / np.linalg.norm(a - b); v = (c - b) / np.linalg.norm(c - b)
        ang = math.acos(max(-1, min(1, float(u @ v))))           # angle between the two legs
        t = r / math.tan(ang / 2)                                 # distance from corner to tangent points
        p_in, p_out = b + u * t, b + v * t
        bis = (u + v) / np.linalg.norm(u + v)
        centre = b + bis * (r / math.sin(ang / 2))
        pieces.append(('straight', cur, p_in))
        a0 = math.atan2(*(p_in - centre)[::-1]); a1 = math.atan2(*(p_out - centre)[::-1])
        d = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi        # shortest signed sweep
        pieces.append(('arc', centre, a0, a0 + d, r))
        cur = p_out
    pieces.append(('straight', cur, P[-1]))
    pts = []
    for pc in pieces:
        if pc[0] == 'straight':
            p0, p1 = pc[1], pc[2]; n = max(1, int(np.linalg.norm(p1 - p0) / step))
            pts += [tuple(p0 + (p1 - p0) * k / n) for k in range(n)]
        else:
            _, c, a0, a1, rr = pc; n = max(2, int(abs(a1 - a0) * rr / step))
            pts += [(c[0] + rr * math.cos(a0 + (a1 - a0) * k / n), c[1] + rr * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n)]
    pts.append(tuple(P[-1]))
    return pts, pieces


def game_path(points, r, step=6.0):
    """Coarser centre line for the game engine (rounded to 0.1)."""
    pts, _ = fillet_path(points, r, step)
    out = [pts[0]]
    for p in pts[1:]:
        if math.dist(p, out[-1]) >= step * 0.99 or p == pts[-1]:
            out.append(p)
    return [[round(x, 1), round(y, 1)] for x, y in out]
