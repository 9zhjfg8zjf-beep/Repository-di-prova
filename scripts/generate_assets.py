#!/usr/bin/env python3
"""Original DITE gate: five pieces, one vector source, opaque app icons.

python3 -m pip install -r scripts/requirements-assets.txt
python3 scripts/generate_assets.py [--check]
No downloaded artwork, fonts or models are used.
"""
from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SIZE = 1024
AMBER = (246, 181, 83)


def curve(a, b, c, d, steps=40):
    return [tuple((1-t)**3*a[k] + 3*(1-t)**2*t*b[k]
                  + 3*(1-t)*t*t*c[k] + t**3*d[k] for k in (0, 1))
            for t in (i/steps for i in range(steps+1))]


def shapes():
    shoulder = curve((244, 452), (244, 340), (328, 246), (438, 183))
    shoulder += [(483, 248)]
    shoulder += curve((483, 248), (398, 306), (332, 372), (332, 452))[1:]
    column = [(244, 476), (332, 476), (332, 756), (244, 756)]
    return [column, shoulder, [(512, 144), (575, 216), (512, 288), (449, 216)],
            [(1024-x, y) for x, y in shoulder], [(1024-x, y) for x, y in column]]


def mark_svg():
    paths = [
        'M244 476H332V756H244Z',
        'M244 452C244 340 328 246 438 183L483 248C398 306 332 372 332 452Z',
        'M512 144L575 216 512 288 449 216Z',
        'M780 452C780 340 696 246 586 183L541 248C626 306 692 372 692 452Z',
        'M692 476H780V756H692Z',
    ]
    body = ''.join(f'<path d="{d}"/>' for d in paths)
    return ('<svg class="brand-mark" viewBox="0 0 1024 1024" '
            'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
            f'<g fill="currentColor">{body}</g></svg>\n')


def icon():
    # Render geometry at double resolution, then downsample for clean small icons.
    scale = 2
    n = SIZE*scale
    small = Image.new('RGB', (128, 128))
    pixels = small.load()
    for y in range(128):
        for x in range(128):
            r = min(1, (((x-64)/87)**2 + ((y-48)/88)**2)**0.5)
            lift = (1-r)**2
            pixels[x, y] = (int(15+29*lift), int(16+14*lift), int(20+9*lift))
    background = small.resize((n, n), Image.Resampling.BICUBIC).convert('RGBA')
    mask = Image.new('L', (n, n))
    draw = ImageDraw.Draw(mask)
    for polygon in shapes():
        draw.polygon([(round(x*scale), round(y*scale)) for x, y in polygon], fill=255)
    glow = Image.new('RGBA', (n, n), (*AMBER, 0))
    glow.putalpha(mask.filter(ImageFilter.GaussianBlur(32*scale)).point(lambda a: round(a*.18)))
    background = Image.alpha_composite(background, glow)
    metal = Image.new('RGBA', (n, n))
    md = ImageDraw.Draw(metal)
    for y in range(n):
        t = min(1, max(0, (y/scale-144)/612))
        color = tuple(round(a+(b-a)*t) for a, b in zip((255, 216, 149), (216, 140, 53)))
        md.line((0, y, n, y), fill=(*color, 255))
    metal.putalpha(mask)
    background = Image.alpha_composite(background, metal)
    # A quiet threshold gives the negative-space doorway a visible base.
    draw = ImageDraw.Draw(background)
    draw.polygon([(378*scale, 800*scale), (646*scale, 800*scale),
                  (674*scale, 822*scale), (350*scale, 822*scale)], fill=(104, 70, 38, 255))
    draw.line((408*scale, 798*scale, 616*scale, 798*scale), fill=(153, 216, 209, 255), width=3*scale)
    return background.resize((SIZE, SIZE), Image.Resampling.LANCZOS).convert('RGB')


def png_bytes(image, size):
    output = BytesIO()
    image.resize((size, size), Image.Resampling.LANCZOS).save(output, 'PNG', optimize=True)
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if generated assets differ.')
    args = parser.parse_args()
    image = icon()
    outputs = {
        ROOT/'assets/dite-mark.svg': mark_svg().encode(),
        ROOT/'arena/icon-180.png': png_bytes(image, 180),
        ROOT/'arena/icon-512.png': png_bytes(image, 512),
        ROOT/'ios/DITE/Assets.xcassets/AppIcon.appiconset/AppIcon.png': png_bytes(image, 1024),
    }
    stale = []
    for path, data in outputs.items():
        if args.check:
            if not path.exists() or path.read_bytes() != data:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            print(f'{path.relative_to(ROOT)}: {len(data)} bytes')
    if stale:
        parser.exit(1, 'Assets out of date: '+', '.join(stale)+'\n')
    if args.check:
        print('DITE artwork is current; app icons are opaque RGB.')


if __name__ == '__main__':
    main()
