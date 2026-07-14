from __future__ import annotations

import math
import os
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
POSTER_DIR = ROOT / "public" / "social" / "cat-posters"
OUT_DIR = ROOT / "public" / "social"
OUT_FILE = OUT_DIR / "cat-tv-parent-ad.mp4"
SILENT_VIDEO_FILE = OUT_DIR / "cat-tv-parent-ad.silent.mp4"
AUDIO_FILE = OUT_DIR / "cat-tv-parent-ad-meows.wav"

WIDTH = 1080
HEIGHT = 1920
FPS = 24
SAMPLE_RATE = 44_100

FONT_CANDIDATES = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
]


SLIDES = [
    {
        "image": "01-fish-british-shorthair.png",
        "title": "Pad 放下",
        "subtitle": "快乐自己会跑过来",
        "duration": 1.8,
    },
    {
        "image": "02-mouse-american-shorthair.png",
        "title": "小老鼠溜过",
        "subtitle": "爪爪马上出击",
        "duration": 1.45,
    },
    {
        "image": "03-dragonfly-ragdoll.png",
        "title": "蜻蜓飞起来",
        "subtitle": "眼神立刻锁定",
        "duration": 1.45,
    },
    {
        "image": "04-butterfly-maine-coon.png",
        "title": "蝴蝶晃一晃",
        "subtitle": "小猫追一追",
        "duration": 1.45,
    },
    {
        "image": "05-bird-siamese.png",
        "title": "小鸟掠过",
        "subtitle": "练练反应力",
        "duration": 1.45,
    },
    {
        "image": "06-cricket-scottish-fold.png",
        "title": "草丛跳一下",
        "subtitle": "注意力上线",
        "duration": 1.45,
    },
    {
        "image": "07-frog-bengal.png",
        "title": "青蛙蹦蹦",
        "subtitle": "捕捉就有奖励",
        "duration": 1.45,
    },
    {
        "image": "08-gecko-persian.png",
        "title": "壁虎慢慢爬",
        "subtitle": "耐心也能训练",
        "duration": 1.45,
    },
]


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in FONT_CANDIDATES:
        if os.path.exists(candidate):
            try:
                return ImageFont.truetype(candidate, size=size)
            except OSError:
                pass
    return ImageFont.load_default()


TITLE_FONT = font(86)
SUBTITLE_FONT = font(46)
SMALL_FONT = font(34)
CTA_FONT = font(66)
URL_FONT = font(46)


def ease(t: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * t)


def cover_crop(img: Image.Image, width: int, height: int, zoom: float, x_bias: float, y_bias: float) -> Image.Image:
    img = img.convert("RGB")
    target_ratio = width / height
    src_ratio = img.width / img.height
    if src_ratio > target_ratio:
        crop_h = img.height / zoom
        crop_w = crop_h * target_ratio
    else:
        crop_w = img.width / zoom
        crop_h = crop_w / target_ratio

    max_x = img.width - crop_w
    max_y = img.height - crop_h
    left = max(0, min(max_x, max_x * x_bias))
    top = max(0, min(max_y, max_y * y_bias))
    cropped = img.crop((left, top, left + crop_w, top + crop_h))
    return cropped.resize((width, height), Image.Resampling.LANCZOS)


def draw_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font_obj, fill: tuple[int, int, int], anchor: str = "la") -> None:
    x, y = xy
    for ox, oy, alpha in [(-3, 4, 130), (3, 4, 110), (0, 0, 255)]:
        color = (0, 0, 0, alpha) if alpha < 255 else fill
        draw.text((x + ox, y + oy), text, font=font_obj, fill=color, anchor=anchor)


def add_gradient(img: Image.Image, top_alpha: int = 150, bottom_alpha: int = 185) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pix = overlay.load()
    for y in range(img.height):
        top = max(0, int(top_alpha * (1 - y / 560))) if y < 560 else 0
        bottom = max(0, int(bottom_alpha * ((y - 1240) / 680))) if y > 1240 else 0
        alpha = max(top, bottom)
        for x in range(img.width):
            pix[x, y] = (0, 0, 0, alpha)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def rounded_panel(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> Image.Image:
    panel = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=fill)
    return panel


def compose_slide(slide: dict[str, object], local_t: float, index: int) -> Image.Image:
    img = Image.open(POSTER_DIR / str(slide["image"]))
    z = 1.02 + 0.08 * ease(local_t)
    x_bias = 0.48 + 0.08 * math.sin(index * 1.7)
    y_bias = 0.44 + 0.08 * math.cos(index * 1.3)
    frame = cover_crop(img, WIDTH, HEIGHT, z, x_bias, y_bias).convert("RGBA")
    frame = add_gradient(frame)

    draw = ImageDraw.Draw(frame)
    top_y = 160
    draw_text(draw, (70, top_y), str(slide["title"]), TITLE_FONT, (255, 255, 255, 255))
    draw_text(draw, (74, top_y + 105), str(slide["subtitle"]), SUBTITLE_FONT, (255, 246, 206, 255))

    panel = rounded_panel((500, 92), 46, (255, 255, 255, 215))
    frame.alpha_composite(panel, (70, HEIGHT - 188))
    draw = ImageDraw.Draw(frame)
    draw.text((108, HEIGHT - 160), "Cat TV 猫咪游戏", font=SMALL_FONT, fill=(25, 40, 48, 255))
    draw.text((108, HEIGHT - 116), "game.cattv.space", font=SMALL_FONT, fill=(22, 112, 130, 255))

    return frame.convert("RGB")


def compose_intro(local_t: float) -> Image.Image:
    base = Image.open(POSTER_DIR / "01-fish-british-shorthair.png")
    frame = cover_crop(base, WIDTH, HEIGHT, 1.08 + 0.04 * ease(local_t), 0.50, 0.50).convert("RGBA")
    blur = frame.filter(ImageFilter.GaussianBlur(8))
    frame = Image.blend(blur, frame, 0.45)
    frame = add_gradient(frame, 210, 220)
    draw = ImageDraw.Draw(frame)
    draw_text(draw, (70, 690), "给小猫一个 Pad", TITLE_FONT, (255, 255, 255, 255))
    draw_text(draw, (74, 805), "它会自己找到快乐", SUBTITLE_FONT, (255, 246, 206, 255))
    return frame.convert("RGB")


def compose_outro(local_t: float) -> Image.Image:
    base = Image.open(POSTER_DIR / "04-butterfly-maine-coon.png")
    frame = cover_crop(base, WIDTH, HEIGHT, 1.12, 0.55, 0.50).convert("RGBA")
    frame = frame.filter(ImageFilter.GaussianBlur(5))
    overlay = Image.new("RGBA", frame.size, (5, 24, 34, 128))
    frame = Image.alpha_composite(frame, overlay)
    draw = ImageDraw.Draw(frame)

    draw_text(draw, (70, 560), "打开 Cat TV", TITLE_FONT, (255, 255, 255, 255))
    draw_text(draw, (74, 690), "让小猫玩 3 分钟", CTA_FONT, (255, 246, 206, 255))

    panel = rounded_panel((840, 122), 61, (255, 255, 255, 225))
    frame.alpha_composite(panel, (70, 880))
    draw = ImageDraw.Draw(frame)
    draw.text((118, 910), "game.cattv.space", font=URL_FONT, fill=(12, 84, 102, 255))
    draw.text((74, 1060), "适合平板 / 触屏 / 猫咪爪爪", font=SMALL_FONT, fill=(255, 255, 255, 235))

    return frame.convert("RGB")


def frames():
    for i in range(int(1.6 * FPS)):
        yield compose_intro(i / max(1, int(1.6 * FPS) - 1))
    for index, slide in enumerate(SLIDES):
        total = int(float(slide["duration"]) * FPS)
        for i in range(total):
            yield compose_slide(slide, i / max(1, total - 1), index)
    for i in range(int(2.2 * FPS)):
        yield compose_outro(i / max(1, int(2.2 * FPS) - 1))


def total_duration() -> float:
    return 1.6 + sum(float(slide["duration"]) for slide in SLIDES) + 2.2


def add_meow(audio: np.ndarray, start: float, duration: float, base_freq: float, volume: float) -> None:
    start_i = max(0, int(start * SAMPLE_RATE))
    count = min(len(audio) - start_i, int(duration * SAMPLE_RATE))
    if count <= 0:
        return

    t = np.linspace(0, duration, count, endpoint=False)
    pitch = base_freq * (1.0 + 0.22 * np.exp(-t * 7.5)) * (1.0 - 0.28 * (t / duration))
    vibrato = 1 + 0.035 * np.sin(2 * math.pi * (18 + base_freq / 130) * t)
    phase = 2 * math.pi * np.cumsum(pitch * vibrato) / SAMPLE_RATE
    voice = (
        np.sin(phase)
        + 0.42 * np.sin(phase * 2.04 + 0.8)
        + 0.18 * np.sin(phase * 3.08 + 1.7)
    )
    mouth = 0.74 + 0.26 * np.sin(math.pi * np.clip(t / duration, 0, 1))
    attack = np.minimum(1, t / 0.055)
    release = np.minimum(1, (duration - t) / 0.16)
    envelope = np.clip(attack, 0, 1) * np.clip(release, 0, 1) * mouth
    trill = 0.08 * np.sin(2 * math.pi * 42 * t) * np.sin(2 * math.pi * 6 * t)
    audio[start_i : start_i + count] += volume * envelope * np.tanh(voice + trill)


def add_purr(audio: np.ndarray, start: float, duration: float, volume: float) -> None:
    start_i = max(0, int(start * SAMPLE_RATE))
    count = min(len(audio) - start_i, int(duration * SAMPLE_RATE))
    if count <= 0:
        return

    t = np.linspace(0, duration, count, endpoint=False)
    rumble = np.sin(2 * math.pi * 58 * t) + 0.45 * np.sin(2 * math.pi * 116 * t)
    pulse = 0.55 + 0.45 * np.sin(2 * math.pi * 10.5 * t)
    fade = np.minimum(1, np.minimum(t / 0.35, (duration - t) / 0.55))
    audio[start_i : start_i + count] += volume * rumble * pulse * fade


def create_audio_track(duration: float) -> None:
    audio = np.zeros(int((duration + 0.05) * SAMPLE_RATE), dtype=np.float32)
    add_purr(audio, 0.05, duration - 0.1, 0.035)

    phrase_starts = [0.28, 0.82, 2.15, 3.6, 5.05, 6.5, 7.95, 9.4, 10.85, 12.3, 13.7]
    for index, start in enumerate(phrase_starts):
        base = 720 + (index % 4) * 70
        add_meow(audio, start, 0.42, base, 0.24)
        add_meow(audio, start + 0.43, 0.34, base * 1.16, 0.18)

    add_meow(audio, duration - 1.35, 0.62, 860, 0.28)
    add_meow(audio, duration - 0.72, 0.48, 980, 0.22)
    audio = np.tanh(audio * 1.28) * 0.84
    pcm = np.int16(np.clip(audio, -1, 1) * 32767)

    with wave.open(str(AUDIO_FILE), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def mux_audio() -> None:
    try:
        import imageio_ffmpeg
    except ImportError as exc:
        raise SystemExit("imageio-ffmpeg is required to mux audio") from exc

    command = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        "-y",
        "-i",
        str(SILENT_VIDEO_FILE),
        "-i",
        str(AUDIO_FILE),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-shortest",
        str(OUT_FILE),
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    SILENT_VIDEO_FILE.unlink(missing_ok=True)
    AUDIO_FILE.unlink(missing_ok=True)


def main() -> None:
    try:
        import imageio.v2 as imageio
    except ImportError as exc:
        raise SystemExit("imageio is required: pip install imageio imageio-ffmpeg") from exc

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with imageio.get_writer(
        SILENT_VIDEO_FILE,
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=16,
        ffmpeg_log_level="error",
    ) as writer:
        for frame in frames():
            writer.append_data(np.asarray(frame))
    create_audio_track(total_duration())
    mux_audio()
    print(OUT_FILE)


if __name__ == "__main__":
    sys.exit(main())
