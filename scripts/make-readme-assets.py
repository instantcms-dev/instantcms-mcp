#!/usr/bin/env python3
"""Генератор картинок для README.

Значения в текстах кадров ЗАФИКСИРОВАНЫ из реальных ответов инструментов
(get_server_capabilities, get_hook_details) — скрипт их не вызывает, сети
не требует. Если вывод инструментов изменился, обновите строки ниже вручную
и перегенерируйте картинки.

Требуется Pillow и моноширинный шрифт (Menlo на macOS, DejaVu на Linux).
Запуск: python3 scripts/make-readme-assets.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

BG = "#0d1117"
BAR = "#161b22"
BORDER = "#30363d"
FG = "#c9d1d9"
MUTED = "#8b949e"
GREEN = "#7ee787"
BLUE = "#79c0ff"
ORANGE = "#ffa657"
PURPLE = "#d2a8ff"
RED = "#ff7b72"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Menlo.ttc",  # macOS
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",  # Linux
    "/usr/share/fonts/dejavu/DejaVuSansMono.ttf",
]
FONT_REG = next((p for p in FONT_CANDIDATES if os.path.exists(p)), FONT_CANDIDATES[0])
W = 1600
PAD = 44
LINE_H = 36
FONT_SIZE = 24
TITLE_SIZE = 20

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "images")


def load_fonts(scale=1):
    size = int(FONT_SIZE * scale)

    def pick(index=0):
        try:
            return ImageFont.truetype(FONT_REG, size, index=index)
        except OSError:  # не .ttc — начертание берём из отдельного файла
            return ImageFont.truetype(FONT_REG, size)

    return (pick(0), pick(1), ImageFont.truetype(FONT_REG, int(TITLE_SIZE * scale)))


def wrap(text, limit):
    out = []
    for raw in text.split("\n"):
        if len(raw) <= limit:
            out.append(raw)
            continue
        cur = ""
        for word in raw.split(" "):
            if len(cur) + len(word) + 1 > limit:
                out.append(cur)
                cur = "    " + word
            else:
                cur = (cur + " " + word).strip()
        out.append(cur)
    return out


def render(title, blocks, scale=1, width=None, wrap_at=96, bar=True):
    """blocks: список (список строк вида (текст, цвет, bold|None))"""
    w = width or W
    fonts = load_fonts(scale)
    reg, bold, small = fonts
    line_h = int(LINE_H * scale)
    pad = int(PAD * scale)

    lines = []
    for block in blocks:
        for text, color, *rest in block:
            is_bold = bool(rest and rest[0])
            for part in wrap(text, wrap_at):
                lines.append((part, color, is_bold))
        lines.append(("", FG, False))

    bar_h = int((58 if bar else 0) * scale)
    text_h = max(line_h * len(lines), line_h)
    height = bar_h + pad * 2 + text_h

    img = Image.new("RGB", (w, height), BG)
    d = ImageDraw.Draw(img)

    d.rounded_rectangle(
        [(0, 0), (w - 1, height - 1)], radius=int(14 * scale), outline=BORDER, width=max(1, int(scale))
    )

    if bar:
        d.rounded_rectangle(
            [(0, 0), (w - 1, bar_h)], radius=int(14 * scale), fill=BAR
        )
        d.rectangle([(0, bar_h - int(16 * scale)), (w - 1, bar_h)], fill=BAR)
        cy = bar_h // 2
        r = int(7 * scale)
        for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
            cx = int((34 + i * 24) * scale)
            d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=c)
        d.text((int(120 * scale), cy), title, font=small, fill=MUTED, anchor="lm")

    y = bar_h + pad
    for text, color, is_bold in lines:
        if text:
            d.text((pad, y), text, font=bold if is_bold else reg, fill=color)
        y += line_h

    return img


def cmd(text):
    return [("$ " + text, GREEN, True)]


# ---------- 1. Масштаб и достоверность ----------

img1 = render(
    "instantcms-mcp — get_server_capabilities",
    [
        cmd("get_server_capabilities"),
        [
            ('{', FG, False),
            ('  "server_version": "1.8.0",', BLUE, False),
            ('  "tools_count": 101,', BLUE, False),
            ('  "knowledge": {', BLUE, False),
            ('    "hooks": 294,', BLUE, False),
            ('    "hook_categories": 56,', BLUE, False),
            ('    "components": 42,', BLUE, False),
            ('    "sources": { "total": 13, "verified": 10, "inferred": 3 }', BLUE, False),
            ('  }', FG, False),
            ('}', FG, False),
        ],
        [("профиль InstantCMS 2.18.2 — verified, привязан к commit исходника", MUTED, False)],
    ],
)

# ---------- 2. Реальный хук с провенансом ----------

img2 = render(
    'instantcms-mcp — get_hook_details("admin_dashboard_block")',
    [
        cmd('get_hook_details  admin_dashboard_block'),
        [
            ("name         admin_dashboard_block", FG, True),
            ("type         filter", FG, False),
            ("category     admin", FG, False),
            ("return_type  array", FG, False),
            ("description  Добавление блока на дашборд администратора.", FG, False),
        ],
        [
            ("parameters", MUTED, True),
            ("  $blocks    array    Массив блоков дашборда    modifiable: true", FG, False),
        ],
        [
            ("source", MUTED, True),
            ("  system/controllers/admin/actions/index.php", BLUE, False),
            ("  system/controllers/admin/actions/index_page_settings.php", BLUE, False),
            ("  occurrences: 2", MUTED, False),
        ],
        [
            ("example", MUTED, True),
            ("  class onMyaddonAdminDashboardBlock extends cmsAction {", PURPLE, False),
            ("      public function run($blocks) {", PURPLE, False),
            ("          $count = $this->model->getCount('myaddon_items');", PURPLE, False),
            ("          $blocks[] = [ 'title' => 'Мой счётчик', 'value' => $count ];", PURPLE, False),
            ("          return $blocks;   // обязательно вернуть данные", ORANGE, False),
            ("      }", PURPLE, False),
            ("  }", PURPLE, False),
        ],
        [
            ("manifest.xml", MUTED, True),
            ('  <hook controller="{your_addon_name}" name="admin_dashboard_block" />', BLUE, False),
        ],
    ],
)

# ---------- 3. Честный отказ ----------

img3 = render(
    "instantcms-mcp — ответ либо есть, либо его нет",
    [
        cmd("get_hook_details  before_save_options"),
        [
            ('{', FG, False),
            ('  "code": "AMBIGUOUS_HOOK",', RED, True),
            ('  "error": "Запрос соответствует нескольким хукам",', FG, False),
            ('  "candidates": [', FG, False),
            ('    "controller_{name}_before_save_options",', BLUE, False),
            ('    "template_before_save_options"', BLUE, False),
            ('  ]', FG, False),
            ('}', FG, False),
        ],
        cmd("get_hook_details  frontpage_before_render"),
        [
            ('{', FG, False),
            ('  "code": "HOOK_NOT_FOUND",', RED, True),
            ('  "error": "Хук не найден",', FG, False),
            ('  "similar_hooks": [ "frontpage", "frontpage_action_index", "frontpage_types" ]', BLUE, False),
            ('}', FG, False),
        ],
        [("Модель не получает правдоподобную выдумку — она получает отказ или список кандидатов.", MUTED, False)],
    ],
)

os.makedirs(OUT_DIR, exist_ok=True)
for name, im in (
    ("knowledge.png", img1),
    ("hook-details.png", img2),
    ("honest-refusal.png", img3),
):
    path = os.path.join(OUT_DIR, name)
    im.save(path, "PNG", optimize=True)
    print(f"{name}: {im.size[0]}x{im.size[1]}, {os.path.getsize(path) // 1024} KB")

# ---------- 4. GIF: команда печатается, ответ появляется ----------

gif_blocks = [
    cmd("get_hook_details  admin_dashboard_block"),
    [
        ("name         admin_dashboard_block", FG, True),
        ("type         filter", FG, False),
        ("category     admin", FG, False),
        ("return_type  array", FG, False),
    ],
    [
        ("parameters", MUTED, True),
        ("  $blocks    array    modifiable: true", FG, False),
    ],
    [
        ("source", MUTED, True),
        ("  system/controllers/admin/actions/index.php", BLUE, False),
        ("  occurrences: 2", MUTED, False),
    ],
    [
        ("example", MUTED, True),
        ("  class onMyaddonAdminDashboardBlock extends cmsAction {", PURPLE, False),
        ("      public function run($blocks) {", PURPLE, False),
        ("          $blocks[] = [ 'title' => 'Мой счётчик' ];", PURPLE, False),
        ("          return $blocks;", ORANGE, False),
        ("      }", PURPLE, False),
        ("  }", PURPLE, False),
    ],
]

# Фиксируем геометрию: все кадры одинаковой высоты, поэтому окно не прыгает.
# FLAT[0] — сама команда, остальное — строки ответа. Пустая строка между
# смысловыми блоками, чтобы в GIF группы не слипались.
FLAT = [(t, c, b) for block in gif_blocks for (t, c, b) in block]
RESPONSE = []
for gi, block in enumerate(gif_blocks[1:], start=1):
    if gi > 1:
        RESPONSE.append(("", FG, False))
    RESPONSE.extend(block)
GIF_W, GIF_SCALE, GIF_WRAP = 1040, 0.68, 74
COMMAND = "get_hook_details  admin_dashboard_block"


def gif_frame(typed: str, shown: int):
    """typed — сколько символов команды напечатано, shown — сколько строк ответа видно."""
    response = [
        (line if i < shown else ("", FG, False))
        for i, line in enumerate(RESPONSE)
    ]
    return render(
        "instantcms-mcp", [cmd(typed), response], scale=GIF_SCALE, width=GIF_W, wrap_at=GIF_WRAP
    )


frames = []
for i in range(4, len(COMMAND) + 1, 3):
    frames.append(gif_frame(COMMAND[:i], 0))
frames.append(gif_frame(COMMAND, 0))
for step in range(1, len(RESPONSE) + 1, 2):
    frames.append(gif_frame(COMMAND, step))
for _ in range(5):  # пауза на финальном кадре
    frames.append(gif_frame(COMMAND, len(RESPONSE)))

gif_path = os.path.join(OUT_DIR, "agent-demo.gif")
frames[-1].save(
    gif_path,
    "GIF",
    save_all=True,
    append_images=frames[:-1],
    duration=140,
    loop=0,
    optimize=True,
    disposal=1,
)
sizes = {f.size for f in frames}
print(f"agent-demo.gif: {frames[0].size[0]}x{frames[0].size[1]}, "
      f"{os.path.getsize(gif_path) // 1024} KB, кадров: {len(frames)}, "
      f"одинаковый размер кадров: {len(sizes) == 1}")
