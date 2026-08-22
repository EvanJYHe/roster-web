#!/usr/bin/env python3
"""Regenerate the ASCII skyline plate in the site footer.

    python3 -m venv .venv && .venv/bin/pip install Pillow numpy
    .venv/bin/python scripts/build-skyline.py > /tmp/skyline.txt

Source photograph: "Atl (Unsplash).jpg", CC0, via Wikimedia Commons. Downtown
Atlanta in fog, which gives the towers atmospheric depth: near ones dark, far
ones fading into the haze. Cached to scripts/.cache/ on first run.

Two separate questions, which an earlier version wrongly answered with one
number, flattening every tower into the same two or three ramp characters:

  WHERE is building?  A per-column sky reference is taken from the top strip
    and smoothed sideways, so a brightness gradient across the sky does not
    bias the threshold. A pixel counts as building when it is meaningfully
    darker than its own column's sky; the roofline is the first run of such
    pixels tall enough not to be noise, and everything above it is empty.

  HOW BRIGHT is it?  The pixel's own luminance, stretched across the ramp
    using percentiles of the masked region only. Using "distance below sky"
    for this too meant a shadowed face got MORE ink than a sunlit one.

The stretch lands in the upper part of the ramp rather than clipping at a
floor, so the faintest building character is still solid and the towers read
as mass while keeping their full tonal range. An unsharp pass recovers facade
detail that the fog flattens.

Finally, glyph choice alone is not enough depth: rendered at one flat colour a
plate reads as uniform texture no matter how many characters the ramp has. So
each cell also carries a brightness level, and the page draws dark cells in dim
grey and lit cells in near white. Ramp steps times brightness steps is what
gives the image its range.

Emits two blocks separated by ---LEVELS---: the characters, then a digit per
cell giving its brightness level.
"""
import os
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageFilter

SRC_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/"
    "Atl_%28Unsplash%29.jpg/3840px-Atl_%28Unsplash%29.jpg"
)
CACHE = os.path.join(os.path.dirname(__file__), ".cache", "skyline.jpg")

RAMP = " .`,:;-~=+*ox%#8@"
CHAR_ASPECT = 0.60  # monospace advance width over line height

# Cropped to the skyline band: the foreground road and the empty upper sky are
# both trimmed, leaving a few rows of clear sky above the tallest tower.
CROP = (200, 520, 3620, 1430)
COLS = 320

DELTA = 9         # grey levels below sky before a pixel counts as building
RUN_FRAC = 0.020  # roofline needs this fraction of the height in a row
SMOOTH = 3        # horizontal smoothing of the roofline, in columns
BLUR = 1.5
SKY_ROWS = 0.04   # top fraction sampled for the sky reference
UNSHARP = 22      # radius of the facade-detail pass
LO_PCT, HI_PCT = 6, 95   # tonal stretch, percentiles of the masked region
GAMMA = 1.2
INK_MIN = 0.40    # faintest building character, as a fraction of the ramp
LEVELS = 10       # brightness steps the page renders, 0 dimmest
SHADE_PCT = (10, 92)     # brightness stretch, percentiles of the masked region


def source() -> str:
    if not os.path.exists(CACHE):
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        req = urllib.request.Request(SRC_URL, headers={"User-Agent": "roster-landing/1.0"})
        with urllib.request.urlopen(req) as r, open(CACHE, "wb") as f:
            f.write(r.read())
    return CACHE


def build() -> str:
    im = Image.open(source()).convert("L").crop(CROP).filter(ImageFilter.GaussianBlur(BLUR))
    a = np.asarray(im, dtype=float)
    height, width = a.shape

    ref = np.median(a[: max(2, int(height * SKY_ROWS))], axis=0)
    k = max(3, width // 24) | 1
    ref = np.convolve(np.pad(ref, (k, k), mode="edge"), np.ones(k) / k, mode="same")[k:-k]

    darker = a < (ref[None, :] - DELTA)
    run = max(2, int(height * RUN_FRAC))
    roof = np.full(width, height, dtype=int)
    for x in range(width):
        c = 0
        col = darker[:, x]
        for y in range(height):
            c = c + 1 if col[y] else 0
            if c >= run:
                roof[x] = y - run + 1
                break

    k2 = SMOOTH * 2 + 1
    roof = np.convolve(np.pad(roof, (k2, k2), mode="edge"), np.ones(k2) / k2, mode="same")[k2:-k2]

    mask = np.arange(height)[:, None] >= roof[None, :]

    soft = np.asarray(
        Image.fromarray(a.astype("uint8")).filter(ImageFilter.GaussianBlur(UNSHARP)),
        dtype=float,
    )
    tone = a + (a - soft) * 1.6

    inside = tone[mask]
    lo, hi = np.percentile(inside, LO_PCT), np.percentile(inside, HI_PCT)
    t = np.clip((tone - lo) / max(1e-6, hi - lo), 0, 1) ** GAMMA

    # Glyph choice is compressed into the upper ramp so a tower is never full
    # of holes, but brightness keeps the FULL range. That split is the whole
    # trick: a shadowed face is a solid character drawn dim, a lit face is a
    # dense character drawn near white. Tying both to the compressed value
    # was why every tower came out the same flat grey.
    value = np.where(mask, INK_MIN + (1.0 - INK_MIN) * t, 0.0)

    # Brightness gets its own stretch and an S-curve, so the plate has true
    # highlights and true shadow rather than a mid-grey majority.
    slo, shi = np.percentile(t[mask], SHADE_PCT[0]), np.percentile(t[mask], SHADE_PCT[1])
    sc = np.clip((t - slo) / max(1e-6, shi - slo), 0, 1)
    sc = sc * sc * (3.0 - 2.0 * sc)
    shade = np.where(mask, sc, 0.0)

    rows = round(COLS * (height / width) * CHAR_ASPECT)
    small = np.asarray(
        Image.fromarray((value * 255).astype("uint8")).resize((COLS, rows), Image.LANCZOS),
        dtype=float,
    ) / 255.0

    small_shade = np.asarray(
        Image.fromarray((shade * 255).astype("uint8")).resize((COLS, rows), Image.LANCZOS),
        dtype=float,
    ) / 255.0

    chars, levels = [], []
    for row, srow in zip(small, small_shade):
        cs, ls = [], []
        for v, sv in zip(row, srow):
            cs.append(RAMP[min(len(RAMP) - 1, int(v * len(RAMP)))])
            ls.append(str(min(LEVELS - 1, int(sv * LEVELS))))
        line = "".join(cs)
        trimmed = line.rstrip()
        chars.append(trimmed)
        levels.append("".join(ls)[: len(trimmed)])

    # Both blocks are pasted into double-quoted TS array literals.
    assert not any('"' in l or "\\" in l for l in chars), "ramp produced unsafe characters"
    return "\n".join(chars), "\n".join(levels)


if __name__ == "__main__":
    art, levels = build()
    print(art)
    print("---LEVELS---")
    print(levels)
    runs = sum(
        1 + sum(1 for i in range(1, len(l)) if l[i] != l[i - 1])
        for l in levels.splitlines() if l
    )
    print(f"\n{len(art.splitlines())} rows x {COLS} cols, {runs} spans", file=sys.stderr)
