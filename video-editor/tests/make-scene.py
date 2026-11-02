# A made-up test scene for judging the looks (no real person): sky, plants, an abstract figure with
# skin tones, a wooden table with a cup, and a gray strip from black to white. 540 by 960 (9:16).
# Written November 2, 2026. Used by tests/looks-sheet.mjs. Needs Python with Pillow and numpy.
# Run: python3 video-editor/tests/make-scene.py <where to save the PNG>
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 540, 960
rng = np.random.default_rng(7)
img = np.zeros((H, W, 3), dtype=np.float32)
# Sky: blue at the top to pale near the middle, then a warm wall
for y in range(H):
    t = min(1, y / 520)
    img[y, :] = np.array([140, 185, 235]) * (1 - t) + np.array([232, 236, 240]) * t
    if y > 520:
        img[y, :] = np.array([214, 200, 182])
base = Image.fromarray(img.clip(0, 255).astype(np.uint8))
d = ImageDraw.Draw(base)
# Plants at the lower left
for (cx, cy, rx, ry, c) in [(70, 640, 90, 60, (52, 120, 62)), (120, 600, 70, 50, (78, 146, 72)), (40, 700, 80, 55, (40, 96, 52)), (150, 680, 60, 40, (96, 160, 84))]:
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)
# The figure: hair, face, neck, shirt
d.ellipse([150, 190, 390, 480], fill=(44, 34, 30))
d.rectangle([238, 440, 302, 540], fill=(208, 158, 128))
d.ellipse([110, 500, 430, 900], fill=(236, 232, 224))
face = Image.new('L', (W, H), 0)
ImageDraw.Draw(face).ellipse([178, 236, 362, 470], fill=255)
skin = np.zeros((H, W, 3), dtype=np.float32)
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - 270) / 95.0) ** 2 + ((yy - 345) / 120.0) ** 2)
light = np.array([242, 200, 172]); dark = np.array([200, 146, 116])
skin = light * (1 - np.clip(r, 0, 1)[..., None]) + dark * np.clip(r, 0, 1)[..., None]
base.paste(Image.fromarray(skin.clip(0, 255).astype(np.uint8)), (0, 0), face)
d = ImageDraw.Draw(base)
d.ellipse([222, 330, 244, 344], fill=(40, 30, 28)); d.ellipse([296, 330, 318, 344], fill=(40, 30, 28))
d.ellipse([248, 405, 292, 422], fill=(200, 112, 112))
blush = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(blush)
bd.ellipse([196, 372, 236, 400], fill=(235, 130, 130, 70)); bd.ellipse([304, 372, 344, 400], fill=(235, 130, 130, 70))
base = Image.alpha_composite(base.convert('RGBA'), blush.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
d = ImageDraw.Draw(base)
# Shadow on the shirt's right side
shade = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shade)
sd.ellipse([300, 520, 470, 900], fill=(60, 50, 50, 90))
base = Image.alpha_composite(base.convert('RGBA'), shade.filter(ImageFilter.GaussianBlur(20))).convert('RGB')
d = ImageDraw.Draw(base)
# The table and a cup of coffee
d.rectangle([0, 780, W, 900], fill=(160, 110, 70))
for y in range(790, 900, 14):
    d.line([0, y, W, y + 4], fill=(140, 92, 58), width=2)
d.rectangle([380, 700, 470, 800], fill=(242, 242, 238))
d.ellipse([380, 688, 470, 712], fill=(92, 58, 36))
d.rectangle([470, 725, 490, 765], outline=(242, 242, 238), width=6)
# A dark corner at the lower right
d.polygon([(W, 600), (W, 780), (470, 780)], fill=(38, 38, 44))
# The gray strip: black to white
for x in range(W):
    v = int(round(255 * x / (W - 1)))
    d.line([x, 900, x, H], fill=(v, v, v))
arr = np.asarray(base).astype(np.float32)
arr[:900] += rng.normal(0, 2.0, size=arr[:900].shape)  # a little grain, like a real camera
Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(sys.argv[1])
print('saved', sys.argv[1])
