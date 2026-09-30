"""Generate the small monochrome icons used by the native WeChat tab bar."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)
SIZE = 81
SCALE = 3


def icon(name: str, color: str, draw_icon) -> None:
    image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    def box(coords):
        return tuple(int(value * SCALE) for value in coords)

    draw_icon(draw, box, color)
    image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(OUT / name)


def chat(draw, box, color):
    draw.rounded_rectangle(box((13, 16, 68, 61)), radius=13 * SCALE, outline=color, width=5 * SCALE)
    draw.polygon([(26 * SCALE, 59 * SCALE), (23 * SCALE, 70 * SCALE), (40 * SCALE, 60 * SCALE)], fill=color)
    draw.line(box((25, 37, 56, 37)), fill=color, width=4 * SCALE)


def analysis(draw, box, color):
    draw.line(box((15, 65, 15, 18)), fill=color, width=5 * SCALE)
    draw.line(box((15, 65, 68, 65)), fill=color, width=5 * SCALE)
    draw.line(box((22, 51, 37, 42)), fill=color, width=5 * SCALE)
    draw.line(box((37, 42, 49, 47)), fill=color, width=5 * SCALE)
    draw.line(box((49, 47, 64, 24)), fill=color, width=5 * SCALE)
    for x, y in [(22, 51), (37, 42), (49, 47), (64, 24)]:
        draw.ellipse(box((x - 3, y - 3, x + 3, y + 3)), fill=color)


def evidence(draw, box, color):
    draw.rounded_rectangle(box((20, 12, 61, 69)), radius=5 * SCALE, outline=color, width=5 * SCALE)
    draw.line(box((29, 28, 52, 28)), fill=color, width=4 * SCALE)
    draw.line(box((29, 40, 52, 40)), fill=color, width=4 * SCALE)
    draw.line(box((29, 52, 47, 52)), fill=color, width=4 * SCALE)


for kind, painter in [("chat", chat), ("analysis", analysis), ("evidence", evidence)]:
    icon(f"tab-{kind}.png", "#5F747C", painter)
    icon(f"tab-{kind}-active.png", "#096B98", painter)

