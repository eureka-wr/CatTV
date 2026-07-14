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
SILENT_VIDEO_FILE = OUT_DIR / "cat-tv-social-ad.silent.mp4"
AUDIO_SOURCE_DIR = OUT_DIR / "audio"

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

AD_VARIANTS = [
    {
        "output": "cat-tv-parent-ad.mp4",
        "audio_source": "cat-come-here.wav",
        "audio_temp": "cat-tv-parent-ad-audio.wav",
    },
    {
        "output": "cat-tv-like-you-ad.mp4",
        "audio_source": "cat-like-you.wav",
        "audio_temp": "cat-tv-like-you-ad-audio.wav",
    },
]


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


def load_real_meow(filename: str) -> np.ndarray:
    path = AUDIO_SOURCE_DIR / filename
    with wave.open(str(path), "rb") as wav:
        sample_rate = wav.getframerate()
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        frames = wav.readframes(wav.getnframes())

    if sample_rate != SAMPLE_RATE or sample_width != 2:
        raise ValueError(f"{path} must be 44.1kHz 16-bit PCM WAV")

    data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)

    peak = float(np.max(np.abs(data))) or 1.0
    data = data / peak
    active = np.flatnonzero(np.abs(data) > 0.025)
    if active.size:
        start = max(0, int(active[0]) - int(0.025 * SAMPLE_RATE))
        end = min(len(data), int(active[-1]) + int(0.06 * SAMPLE_RATE))
        data = data[start:end]

    fade_count = min(len(data) // 4, int(0.035 * SAMPLE_RATE))
    if fade_count:
        fade_in = np.linspace(0, 1, fade_count)
        fade_out = np.linspace(1, 0, fade_count)
        data[:fade_count] *= fade_in
        data[-fade_count:] *= fade_out

    return data


def load_custom_audio(filename: str) -> np.ndarray:
    path = AUDIO_SOURCE_DIR / filename
    with wave.open(str(path), "rb") as wav:
        sample_rate = wav.getframerate()
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        frames = wav.readframes(wav.getnframes())

    if sample_rate != SAMPLE_RATE or sample_width != 2:
        raise ValueError(f"{path} must be 44.1kHz 16-bit PCM WAV")

    data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)

    return data


def place_clip(audio: np.ndarray, clip: np.ndarray, start: float, volume: float) -> None:
    start_i = max(0, int(start * SAMPLE_RATE))
    count = min(len(audio) - start_i, len(clip))
    if count <= 0:
        return

    audio[start_i : start_i + count] += clip[:count] * volume


def create_audio_track(duration: float, source_filename: str, output_file: Path) -> None:
    audio = np.zeros(int((duration + 0.05) * SAMPLE_RATE), dtype=np.float32)
    custom_call = load_custom_audio(source_filename)
    place_clip(audio, custom_call, 0.0, 1.08)

    fade_count = int(0.35 * SAMPLE_RATE)
    if fade_count:
        audio[:fade_count] *= np.linspace(0, 1, fade_count)
        audio[-fade_count:] *= np.linspace(1, 0, fade_count)

    peak = float(np.max(np.abs(audio))) or 1.0
    audio = audio / peak * 0.86
    pcm = np.int16(np.clip(audio, -1, 1) * 32767)

    with wave.open(str(output_file), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def mux_audio(silent_video_file: Path, audio_file: Path, output_file: Path) -> None:
    try:
        import imageio_ffmpeg
    except ImportError as exc:
        raise SystemExit("imageio-ffmpeg is required to mux audio") from exc

    command = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        "-y",
        "-i",
        str(silent_video_file),
        "-i",
        str(audio_file),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-shortest",
        str(output_file),
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


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

    for variant in AD_VARIANTS:
        output_file = OUT_DIR / str(variant["output"])
        audio_file = OUT_DIR / str(variant["audio_temp"])
        create_audio_track(total_duration(), str(variant["audio_source"]), audio_file)
        mux_audio(SILENT_VIDEO_FILE, audio_file, output_file)
        audio_file.unlink(missing_ok=True)
        print(output_file)

    SILENT_VIDEO_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    sys.exit(main())
