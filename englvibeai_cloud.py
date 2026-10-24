"""
GitHub Actions version: bir marta ishlaydi, postni yuboradi va tugaydi.
Kalitlar GitHub Secrets'dan (environment) olinadi, kod ichida kalit yo'q.
"""
import html
import os
import re
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

import requests

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
FORCE_PILLAR = os.environ.get("FORCE_PILLAR", "").strip().upper()  # ixtiyoriy: A/B/C/D

TZ = ZoneInfo("Asia/Tashkent")
SEND_TIMES = ["08:00", "11:00", "14:00", "17:00", "20:00"]
SLOT_PILLARS = ["D", "B", "C", "A", "B"]  # A=Speaking, B=Reading, C=Listening, D=Vocabulary
MODEL = ""  # bo'sh = avtomatik tanlanadi

SYSTEM_PROMPT = """You are an elite English language expert and CEFR B2/C1 curriculum designer.
Generate one daily post for a Telegram study group of Uzbek-speaking students preparing for CEFR mock exams.
Rules:
- Strictly B2/C1 level; sophisticated collocations, native-like phrasal verbs.
- Include clear, natural Uzbek support (translations, explanations).
- Telegram-optimized: short lines, bullets, emojis, **bold** for key terms and answers.
- Tone: authoritative, encouraging, mentorship-driven.
- End with a brief interactive challenge inviting students to reply in the comments.
- Output ONLY the post. No preamble. Max 3500 characters.
"""

PILLARS = {
    "A": """PILLAR A - Speaking simulation (Part 1, 2 or 3):
1. 📌 Topic (sophisticated academic/lifestyle theme)
2. 🗣 Level: B2/C1
3. ❓ 2-3 challenging exam-style questions
4. 💡 Band 8+ sample answer fragment with advanced collocations, plus Uzbek translations and usage.""",
    "B": """PILLAR B - Mini Reading Task:
1. 📖 Passage (100-150 words; science/psychology/technology/sociology)
2. ❓ One rigorous multiple-choice or analytical question
3. 🔑 Correct answer with deep-dive explanation in Uzbek.""",
    "C": """PILLAR C - Listening Strategy:
1. 🎧 Listening Masterclass (traps, distractors, signpost words, accents)
2. 💡 Strategic Rule: one concrete technique for exam pressure
3. 📝 Mini-Example: short dialogue showing distractor vs correct answer.""",
    "D": """PILLAR D - Advanced Vocabulary & Idioms:
📚 Lexical Resource Booster: 3 C1-level words/idioms. For each: word + pronunciation + part of speech,
English definition, Uzbek translation, natural example sentence.""",
}


def pick_pillar(now):
    """Hozirgi Toshkent vaqtiga eng yaqin slotning pillarini oladi (Actions kechikishi uchun)."""
    if FORCE_PILLAR in PILLARS:
        return FORCE_PILLAR
    minutes = now.hour * 60 + now.minute
    def dist(t):
        h, m = map(int, t.split(":"))
        return abs(h * 60 + m - minutes)
    slot = min(range(len(SEND_TIMES)), key=lambda i: dist(SEND_TIMES[i]))
    return SLOT_PILLARS[slot]


def pick_model():
    if MODEL:
        return MODEL
    r = requests.get(
        "https://api.groq.com/openai/v1/models",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
        timeout=30,
    )
    if not r.ok:
        sys.exit(f"Groq modellar xatosi {r.status_code}: {r.text}")
    ids = [m["id"] for m in r.json()["data"]]
    skip = ("whisper", "guard", "tts", "orpheus", "embed", "safeguard", "playai", "distil")
    chat = [i for i in ids if not any(s in i.lower() for s in skip)]
    for key in ("gpt-oss-120b", "70b", "120b", "qwen", "llama", "gpt-oss"):
        for i in chat:
            if key in i.lower():
                return i
    if chat:
        return chat[0]
    sys.exit("Mos chat modeli topilmadi.")


def generate_post(pillar, now):
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
        json={
            "model": pick_model(),
            "max_tokens": 1500,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content":
                    f"Today's date: {now:%d %B %Y}. Create today's post.\n\n{PILLARS[pillar]}"},
            ],
        },
        timeout=90,
    )
    if not r.ok:
        sys.exit(f"Groq xatosi {r.status_code}: {r.text}")
    return r.json()["choices"][0]["message"]["content"].strip()


def to_telegram_html(text):
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html.escape(text), flags=re.S)


def send_to_telegram(text):
    r = requests.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": to_telegram_html(text)[:4096],
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        },
        timeout=30,
    )
    if not r.ok:
        sys.exit(f"Telegram xatosi {r.status_code}: {r.text}")


if __name__ == "__main__":
    now = datetime.now(TZ)
    pillar = pick_pillar(now)
    print(f"Toshkent vaqti: {now:%H:%M} -> Pillar {pillar}")
    post = generate_post(pillar, now)
    print(post)
    send_to_telegram(post)
    print("Yuborildi ✅")
