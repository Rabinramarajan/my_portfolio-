"""
Profile photo pipeline — implements the §5 master-edit spec.

Usage:
    python scripts/photo-pipeline.py [source-image] [--out DIR]

Defaults: source = public/profile.png, out = scripts/out-photo/

Produces:
    cutout.png / cutout.avif    transparent subject (1200px wide max)
    hero-dark.webp/.avif        4:5 1600x2000, Ink 950 -> deep violet gradient
    theme-light.webp            cutout over Paper #F7F7FB with violet shadow
    linkedin.png                1:1 800x800, brighter grade, tight face crop
    github.png                  1:1 500x500, same crop as LinkedIn
    og-image.png                1200x630 social card (name + role + wordmark)

Swap in the real master photo (mall shot or re-shoot) and re-run.
"""

import sys
from pathlib import Path

import pillow_avif  # noqa: F401  (registers AVIF codec)
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
ASSETS = Path(__file__).resolve().parent / "assets"

INK_950 = (13, 17, 23)
DEEP_VIOLET = (30, 27, 51)
VIOLET_400 = (158, 140, 252)
PAPER = (247, 247, 251)


def grade(img: Image.Image, brighter: bool = False) -> Image.Image:
    """Neutral-to-cool white balance, gentle S-curve, lifted shadows."""
    r, g, b, *rest = img.split()
    r = r.point(lambda v: v * 0.97)          # pull warmth
    b = b.point(lambda v: min(255, v * 1.03))  # push cool
    img = Image.merge(img.mode, (r, g, b, *rest))

    def s_curve(v: int) -> int:
        x = v / 255
        y = x + 0.10 * (x - 0.5) * (1 - abs(2 * x - 1))  # gentle S
        y = y + 0.03 * (1 - x)                            # lift shadows
        return max(0, min(255, round(y * 255)))

    bands = img.split()
    rgb = [band.point(s_curve) for band in bands[:3]]
    img = Image.merge(img.mode, (*rgb, *bands[3:]))
    if brighter:
        img = ImageEnhance.Brightness(img).enhance(1.07)
    return img


def dark_gradient(size: tuple[int, int], glow_center: tuple[float, float]) -> Image.Image:
    """Ink 950 -> deep violet vertical gradient + soft violet glow."""
    w, h = size
    bg = Image.new("RGB", (w, h))
    for y in range(h):
        t = y / h
        bg.paste(
            tuple(round(INK_950[i] * (1 - t) + DEEP_VIOLET[i] * t) for i in range(3)),
            (0, y, w, y + 1),
        )
    glow = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(glow)
    gx, gy = int(w * glow_center[0]), int(h * glow_center[1])
    gr = int(w * 0.45)
    d.ellipse((gx - gr, gy - gr, gx + gr, gy + gr), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(w // 6))
    violet_layer = Image.new("RGB", (w, h), VIOLET_400)
    bg = Image.composite(violet_layer, bg, glow)
    return bg.filter(ImageFilter.GaussianBlur(3))  # background-only softness


def chest_crop(cutout: Image.Image, keep: float = 0.62) -> Image.Image:
    """Crop the subject at mid-chest: keep the top `keep` fraction of its bbox.
    Removes desk/prop clutter; composites must bottom-align so the cut edge
    lands on the canvas edge."""
    box = cutout.getbbox()
    sub = cutout.crop(box)
    return sub.crop((0, 0, sub.width, int(sub.height * keep)))


def paste_subject(bg: Image.Image, sub: Image.Image, head_at: float) -> Image.Image:
    """Bottom-align the subject; scale it so its top sits at `head_at` x canvas height."""
    w, h = bg.size
    target_h = int(h * (1 - head_at))
    ratio = target_h / sub.height
    sub = sub.resize((int(sub.width * ratio), target_h), Image.LANCZOS)
    x = (w - sub.width) // 2
    canvas = bg.convert("RGBA")
    canvas.alpha_composite(sub, (x, h - sub.height))
    return canvas.convert("RGB")


def head_center_x(sub: Image.Image) -> int:
    """Horizontal centroid of the alpha mass in the top 25% of the subject (the head)."""
    alpha = sub.split()[-1]
    top = alpha.crop((0, 0, sub.width, max(1, int(sub.height * 0.25))))
    hist_x = [0] * top.width
    px = top.load()
    for y in range(top.height):
        for x in range(top.width):
            hist_x[x] += px[x, y]
    total = sum(hist_x) or 1
    return int(sum(x * v for x, v in enumerate(hist_x)) / total)


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "profile.png"
    out = ROOT / "scripts" / "out-photo"
    if "--out" in sys.argv:
        out = Path(sys.argv[sys.argv.index("--out") + 1])
    out.mkdir(parents=True, exist_ok=True)

    print(f"source: {src}")
    master = Image.open(src).convert("RGBA")

    print("removing background (u2net + alpha matting)...")
    session = new_session("u2net")
    cutout = remove(
        master,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=10,
    )
    cutout = grade(cutout)

    # --- Transparent PNG / AVIF ---
    slim = cutout.copy()
    slim.thumbnail((1200, 10_000), Image.LANCZOS)
    slim.save(out / "cutout.png")
    slim.save(out / "cutout.avif", quality=80)

    # --- Hero / dark theme 4:5 ---
    bust = chest_crop(cutout)
    hero_bg = dark_gradient((1600, 2000), glow_center=(0.5, 0.35))
    hero = paste_subject(hero_bg, bust, head_at=0.10)
    hero.save(out / "hero-dark.webp", quality=88)
    hero.save(out / "hero-dark.avif", quality=75)

    # --- Light theme ---
    light_bg = Image.new("RGB", (1600, 2000), PAPER)
    shadow = Image.new("L", (1600, 2000), 0)
    ImageDraw.Draw(shadow).ellipse((300, 1500, 1300, 1950), fill=60)
    shadow = shadow.filter(ImageFilter.GaussianBlur(120))
    light_bg = Image.composite(Image.new("RGB", (1600, 2000), VIOLET_400), light_bg, shadow)
    light = paste_subject(light_bg, bust, head_at=0.10)
    light.save(out / "theme-light.webp", quality=88)

    # --- LinkedIn / GitHub (tight head-and-shoulders, brighter) ---
    bright_bust = chest_crop(ImageEnhance.Brightness(cutout).enhance(1.07), keep=0.62)
    side = int(bright_bust.height * 1.15)
    canvas = dark_gradient((side, side), glow_center=(0.5, 0.3)).convert("RGBA")
    cx = head_center_x(bright_bust)
    canvas.alpha_composite(
        bright_bust, (side // 2 - cx, side - bright_bust.height)
    )
    # face fills ~60%: crop square around the head, top margin ~6%
    crop_side = int(bright_bust.height * 0.80)
    left = max(0, side // 2 - crop_side // 2)
    top = int(side * 0.04)
    li = canvas.crop((left, top, left + crop_side, top + crop_side)).convert("RGB")
    li.resize((800, 800), Image.LANCZOS).save(out / "linkedin.png")
    li.resize((500, 500), Image.LANCZOS).save(out / "github.png")

    # --- OG image 1200x630 ---
    og = dark_gradient((1200, 630), glow_center=(0.78, 0.5))
    og = og.convert("RGBA")
    sub = chest_crop(cutout, keep=0.55)
    sub_h = 630
    sub = sub.resize((int(sub.width * sub_h / sub.height), sub_h), Image.LANCZOS)
    og.alpha_composite(sub, (1200 - sub.width + 40, 630 - sub.height))
    d = ImageDraw.Draw(og)
    f_name = ImageFont.truetype(str(ASSETS / "GeneralSans-Semibold.ttf"), 72)
    f_role = ImageFont.truetype(str(ASSETS / "GeneralSans-Medium.ttf"), 32)
    f_mark = ImageFont.truetype(str(ASSETS / "GeneralSans-Semibold.ttf"), 30)
    d.text((80, 200), "Rabin R", font=f_name, fill=(248, 250, 252))
    d.text((80, 300), "Senior Frontend Engineer", font=f_role, fill=(168, 168, 192))
    d.text((80, 348), "Founder, Zellavora", font=f_role, fill=VIOLET_400)
    d.text((80, 500), "rabinr.in", font=f_mark, fill=(120, 120, 143))
    og.convert("RGB").save(out / "og-image.png")

    print(f"done -> {out}")


if __name__ == "__main__":
    main()
