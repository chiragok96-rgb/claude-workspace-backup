# land-10m topojson -> polygons in table metres (1 m = 540 km), clipped to the voyage region
import json, math, sys
sys.setrecursionlimit(100000)
T = json.load(open(sys.argv[1])); sc, tr = T['transform']['scale'], T['transform']['translate']
arcs = []
for a in T['arcs']:
    x = y = 0; pts = []
    for dx, dy in a: x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    arcs.append(pts)
def ring(ids):
    out = []
    for i in ids:
        p = arcs[i] if i >= 0 else arcs[~i][::-1]
        out += p[1:] if out else p
    return out
LON0, LAT0, KM = 100.0, 7.0, 540.0
def P(lon, lat): return (round((lon - LON0) * 111.32 * math.cos(math.radians(LAT0)) / KM, 4), round(-(lat - LAT0) * 110.57 / KM, 4))
def simp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, k = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
        d = abs(dy * (p[0] - a[0]) - dx * (p[1] - a[1])) / L
        if d > dmax: dmax, k = d, i
    if dmax > eps: return simp(pts[:k + 1], eps)[:-1] + simp(pts[k:], eps)
    return [a, b]
polys = []
for g in T['objects']['land']['geometries']:
    gs = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    for poly in gs:
        r = ring(poly[0])
        if not any(70 < lon < 128 and -14 < lat < 30 for lon, lat in r): continue
        r = [(min(max(lon, 60), 140), min(max(lat, -25), 40)) for lon, lat in r]
        pp = [P(*p) for p in r]; k = max(range(len(pp)), key=lambda i: (pp[i][0]-pp[0][0])**2 + (pp[i][1]-pp[0][1])**2)
        q = simp(pp[:k + 1], .004)[:-1] + simp(pp[k:], .004)
        xs = [p[0] for p in q]; ys = [p[1] for p in q]
        if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 1e-4: continue
        polys.append(q)
# places (lon, lat)
places = {'puri': (85.83, 19.80), 'cuttack': (85.88, 20.46), 'paradip': (86.67, 20.26), 'bali': (115.19, -8.41), 'java': (110.4, -7.4), 'sumatra': (101.5, 0.0), 'srilanka': (80.7, 7.8), 'malacca': (100.5, 3.2)}
json.dump({'km_per_m': KM, 'lon0': LON0, 'lat0': LAT0, 'polys': polys, 'places': {k: P(*v) for k, v in places.items()}}, open(sys.argv[2], 'w'))
print(len(polys), sum(len(p) for p in polys), {k: P(*v) for k, v in places.items()})
# high-detail rings for the island under the footprint (Bali, Nusa Penida, Lombok's west coast, East Java's tip)
hi = []
for g in T['objects']['land']['geometries']:
    for poly in g['arcs']:
        r = ring(poly[0])
        if any(114.2 < lon < 116.8 and -9.1 < lat < -7.9 for lon, lat in r) and all(113.5 < lon < 117 for lon, lat in r):
            pp = [P(*p) for p in r]; k = max(range(len(pp)), key=lambda i: (pp[i][0]-pp[0][0])**2 + (pp[i][1]-pp[0][1])**2)
            q = simp(pp[:k + 1], .0006)[:-1] + simp(pp[k:], .0006)
            if len(q) > 6: hi.append(q)
D = json.load(open(sys.argv[2])); D['hi'] = hi; json.dump(D, open(sys.argv[2], 'w'))
print('hi', [len(h) for h in hi])
