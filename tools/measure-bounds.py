"""Print the opaque bounding box of each sprite as fractions of the image size.

Run from the starter kit folder:  python3 tools/measure-bounds.py
Paste the output into FK.SPRITE_BOUNDS in js/config.js.
"""
from PIL import Image

ASSETS = 'assets/'
NAMES = ['ghosty', 'ghost-front', 'ghost-back', 'ghost-left', 'ghost-right', 'door', 'shadow']
ALPHA_MIN = 40  # ignore faint anti-aliasing


def bounds(name):
    im = Image.open(f'{ASSETS}{name}.png').convert('RGBA')
    w, h = im.size
    mask = im.split()[3].point(lambda a: 255 if a >= ALPHA_MIN else 0)
    box = mask.getbbox()
    corner = im.getpixel((0, 0))
    return w, h, box, corner


if __name__ == '__main__':
    for n in NAMES:
        w, h, box, corner = bounds(n)
        l, t, r, b = box
        print(f"  '{n}.png': {{ w: {w}, h: {h}, l: {l / w:.4f}, t: {t / h:.4f}, r: {r / w:.4f}, b: {b / h:.4f} }},"
              f"  // box={box} corner={corner}")
