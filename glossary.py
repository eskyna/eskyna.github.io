#!/usr/bin/env python3
import os
import re
import time
import argparse
import sys
import threading
import queue
import unicodedata
from dataclasses import dataclass
from datetime import date
from pathlib import Path

# --------------------------------------------------------
# Konfiguration
# --------------------------------------------------------

MODEL = "gemini-3.5-flash"

AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT')
AZURE_OPENAI_DEPLOYMENT = os.environ.get('AZURE_OPENAI_DEPLOYMENT')
AZURE_OPENAI_SCOPE = os.environ.get('AZURE_OPENAI_SCOPE')

# Ordner-Pfade für die verschiedenen Sprachen
ROOTS = {
    "de": Path("content/de/glossar"),
    "en": Path("content/en/glossar"),
    "ru": Path("content/ru/glossar")
}

DEFAULT_LANGUAGES = ["de", "en", "ru"]

# Sprachspezifische Prompts
PROMPTS = {
    "de": """
Du bist Modehistoriker, Textredakteur und SEO-Experte.
Du erhältst einen Glossareintrag als Markdown.
Deine Aufgabe: den Beitrag deutlich verbessern, stark auf SEO optimieren und trotzdem natürlich schreiben.

Pflichtregeln:
- Schreibe auf Deutsch in der Du-Form. Nutze du, dir, dein.
- Nutze keine Sie-Form.
- Nutze keine Gedankenstriche (–, —) und keinen künstlichen ChatGPT-Bindestrichstil.
- Schreibe klar, konkret und lesbar. Kein aufgeblähter Ton.
- Keine Fakten erfinden. Nur allgemein bekannte oder im Text belastbar ableitbare Inhalte ergänzen.

SEO- und Strukturziele:
- Suchintention sauber treffen.
- Wichtige Begriffe organisch in Überschriften und Fließtext integrieren.
- Prägnante Absätze, klare Zwischenüberschriften, starke Einleitung.
- Hohe semantische Relevanz ohne Keyword-Stuffing.

Interne Verlinkung und Glossarlogik:
- Nutze die bereitgestellte Liste vorhandener Glossareinträge.
- Setze sinnvolle interne Links auf verwandte Begriffe im Fließtext.
- Ergänze bzw. verbessere relatedTerms im Frontmatter mit passenden, ähnlichen Einträgen.
- Verwende nur Einträge aus der bereitgestellten Liste. Keine toten Links.

Frontmatter-Regeln:
- Bestehende Felder erhalten.
- Bilder, Tabellen, Codeblöcke und bestehende externe Links nicht beschädigen.
- Wenn es zum Begriff besonders interessante Kernaussagen gibt, füge im YAML ein Feld knowledge hinzu.
- Wenn es wichtige historische Einordnung gibt, füge im YAML ein Feld history hinzu.
- Füge knowledge/history nur ein, wenn inhaltlich sinnvoll.

Antworte ausschließlich mit dem vollständigen überarbeiteten Markdown.
Keine Erklärungen.
""",

    "en": """
You are a fashion historian, text editor, and SEO expert.
You receive a glossary entry in Markdown.
Your task: significantly improve it, make it highly SEO-effective, and keep the tone natural.

Mandatory rules:
- Write clearly and naturally, never robotic.
- Do not use em dash or en dash and avoid artificial dash-heavy phrasing.
- Do not invent facts.

SEO and structure goals:
- Match search intent.
- Use relevant terms organically in headings and body text.
- Improve semantic coverage and readability without keyword stuffing.

Internal linking and glossary logic:
- Use the provided list of available glossary entries.
- Add useful internal links to related glossary terms in body text.
- Improve relatedTerms in frontmatter with strong, genuinely similar entries.
- Use only entries from the provided list.

Frontmatter rules:
- Preserve existing fields.
- Do not break images, tables, or code blocks.
- If there is especially useful contextual insight, add a YAML field knowledge.
- If there is meaningful historical context, add a YAML field history.
- Add knowledge/history only when relevant.

Respond only with the fully revised Markdown.
No explanations.
""",

    "ru": """
Вы историк моды, текстовый редактор и SEO-эксперт.
Вы получаете словарную статью в формате Markdown.
Ваша задача: существенно улучшить статью, усилить SEO и сохранить естественный стиль.

Обязательные правила:
- Пишите уважительно в форме «вы».
- Не используйте длинные тире (–, —) и искусственный «чат-стиль» с тире.
- Не выдумывайте факты.

SEO и структура:
- Точно попадать в поисковое намерение.
- Органично использовать релевантные термины в заголовках и тексте.
- Повысить семантическую полноту и читаемость без переспама ключевыми словами.

Внутренняя перелинковка и глоссарий:
- Используйте предоставленный список доступных глоссарных статей.
- Добавляйте уместные внутренние ссылки на связанные термины в тексте.
- Улучшайте relatedTerms в frontmatter, предлагая действительно похожие и полезные записи.
- Используйте только записи из предоставленного списка.

Правила для frontmatter:
- Сохраните существующие поля.
- Не ломайте изображения, таблицы и блоки кода.
- Если есть важные и интересные факты по теме, добавьте поле YAML knowledge.
- Если есть значимый исторический контекст, добавьте поле YAML history.
- Добавляйте knowledge/history только по смыслу.

Отвечайте исключительно полным пересмотренным Markdown.
Никаких объяснений.
"""
}

GLOSSARY_CONTEXT_CACHE = {}
GLOSSAR_TEMPLATE_CACHE = {}

# Canonical public URLs / aliases for newly created glossary pages.
GLOSSARY_URLS = {
    "de": {
        "url": "/glossar/{slug}/",
        "aliases": [],
    },
    "en": {
        "url": "/en/glossary/{slug}/",
        "aliases": ["/en/glossar/{slug}/", "/glossary/{slug}/"],
    },
    "ru": {
        "url": "/rus/glossariy/{slug}/",
        "aliases": ["/rus/glossar/{slug}/", "/ru/glossar/{slug}/"],
    },
}

CREATE_USER_PROMPTS = {
    "de": """Erstelle einen vollständigen neuen Glossareintrag als Markdown inklusive YAML-Frontmatter.

Ausgangswerte:
- Begriff (Deutsch, so übernehmen bzw. nur minimal glätten): {term}
- Kurzbeschreibung (Ausgangspunkt, ausformulieren und SEO-fähig machen): {description}
- slug (unveränderlich exakt so setzen): {slug}
- url (unveränderlich): {url}
- lastmod: "{today}"
- image: images/glossar/{slug}.png
- image_alt: kurze, konkrete Bildbeschreibung zu dem Begriff

Pflicht:
- Antworte ausschließlich mit dem fertigen Markdown.
- Keine Erklärungen und keine Code-Fences.
- Frontmatter muss mit --- beginnen und enden.
- Schreibe auf Deutsch in der Du-Form.
- Nutze keine Gedankenstriche (en/em dash).
- Setze sinnvolle interne Links und relatedTerms nur aus der bereitgestellten Glossarliste.
- Der Markdown-Body soll ein vollständiger, praktischer Glossarartikel sein (Definition, Wirkung, Anwendung, Missverständnisse, Praxischeck, Merksatz).
""",
    "en": """Create a complete new glossary entry as Markdown including YAML frontmatter.

Source input (German seed; localize into natural English):
- Source term: {term}
- Short description: {description}
- slug (must stay exactly): {slug}
- url (must stay exactly): {url}
- aliases (include all of these):
{aliases}
- lastmod: "{today}"
- image: images/glossar/{slug}.png
- image_alt: short concrete image description

Requirements:
- Respond only with the finished Markdown.
- No explanations and no code fences.
- Frontmatter must start and end with ---.
- Write clear natural English.
- Do not use en dashes or em dashes.
- Use internal links and relatedTerms only from the provided glossary list.
- Body must be a full practical glossary article (definition, effect, how to use, misunderstandings, practical check, key line).
- Choose a natural English `term` / `title` for the concept; keep the shared German-based slug.
""",
    "ru": """Создайте полную новую словарную статью в Markdown с YAML-frontmatter.

Исходные данные (немецкий сид; локализуйте на естественный русский):
- Исходный термин: {term}
- Краткое описание: {description}
- slug (оставить точно таким): {slug}
- url (оставить точно таким): {url}
- aliases (включить все):
{aliases}
- lastmod: "{today}"
- image: images/glossar/{slug}.png
- image_alt: короткое конкретное описание изображения

Требования:
- Отвечайте только готовым Markdown.
- Без пояснений и без code fences.
- Frontmatter должен начинаться и заканчиваться ---.
- Пишите уважительно на «вы».
- Не используйте длинные тире (en/em dash).
- Внутренние ссылки и relatedTerms только из предоставленного списка глоссария.
- Текст должен быть полной практической статьёй (определение, эффект, применение, заблуждения, практическая проверка, ключевая мысль).
- Выберите естественный русский `term` / `title`; общий slug на немецкой основе сохраните.
""",
}


@dataclass(frozen=True)
class NewGlossaryItem:
    term: str
    description: str
    slug: str


# --------------------------------------------------------
# Threading & UI Setup
# --------------------------------------------------------

# Sperre, damit die Prints der Worker sich nicht überschneiden
print_lock = threading.Lock()
tracker = None
STOP_WORKER = object()

class ProgressTracker:
    def __init__(self, total):
        self.total = total
        self.current = 0
        self.start_time = time.time()
        self.bar_length = 40

    def update(self):
        """Erhöht den Zähler und zeichnet den Balken neu (Thread-sicher)."""
        with print_lock:
            self.current += 1
            self._draw()

    def _draw(self):
        """Zeichnet den Balken. Darf nur aufgerufen werden, wenn print_lock aktiv ist!"""
        if self.total == 0:
            return
            
        percent = self.current / self.total
        filled = int(self.bar_length * percent)
        bar = '█' * filled + '░' * (self.bar_length - filled)
        
        elapsed = time.time() - self.start_time
        mins, secs = divmod(int(elapsed), 60)
        time_str = f"{mins:02d}:{secs:02d}"

        # \r springt an den Zeilenanfang, \033[2K löscht die gesamte Zeile
        sys.stdout.write(f"\r\033[2K⏳ [{bar}] {int(percent * 100)}% ({self.current}/{self.total}) | ⏱️ {time_str}")
        sys.stdout.flush()

def safe_print(*args, **kwargs):
    """Thread-sicheres Print, das den Fortschrittsbalken respektiert."""
    with print_lock:
        # Aktuelle Zeile (wo der Balken ist) leeren
        sys.stdout.write("\r\033[2K")
        print(*args, **kwargs)
        
        # Balken sofort wieder in die neue, leere End-Zeile zeichnen
        if tracker:
            tracker._draw()

def get_api_keys():
    """Sammelt alle API Keys aus dem Environment, die mit GEMINI_API_KEY beginnen."""
    keys = set()
    
    # Fallback für den klassischen Key
    if "GEMINI_API_KEY" in os.environ:
        keys.add(os.environ["GEMINI_API_KEY"])
        
    # Suche nach GEMINI_API_KEY_1, GEMINI_API_KEY_2 etc.
    for key, value in os.environ.items():
        if key.startswith("GEMINI_API_KEY"):
            if value.strip():  # Leere Strings ignorieren
                keys.add(value.strip())
                
    return list(keys)


def _extract_frontmatter(content: str) -> str:
    """Extrahiert den YAML-Frontmatter-Block (ohne Trenner) oder gibt leeren String zurück."""
    m = re.search(r"^\s*---\r?\n(.*?)\r?\n---", content, re.DOTALL | re.MULTILINE)
    return m.group(1) if m else ""


def _frontmatter_value(frontmatter: str, key: str) -> str | None:
    m = re.search(rf"^{key}:\s*(.*)$", frontmatter, re.MULTILINE)
    if not m:
        return None
    val = m.group(1).strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1].strip()
    return val


def build_glossary_context(lang: str) -> str:
    """Erstellt eine kompakte Liste aller Glossareinträge einer Sprache für den Modell-Prompt."""
    if lang in GLOSSARY_CONTEXT_CACHE:
        return GLOSSARY_CONTEXT_CACHE[lang]

    root = ROOTS.get(lang)
    if not root or not root.exists():
        GLOSSARY_CONTEXT_CACHE[lang] = ""
        return ""

    lang_prefix = "" if lang == "de" else f"/{lang}"
    entries = []

    for file in sorted(root.rglob("*.md")):
        try:
            content = file.read_text(encoding="utf-8")
        except Exception:
            continue

        fm = _extract_frontmatter(content)
        term = _frontmatter_value(fm, "term") or _frontmatter_value(fm, "title") or file.stem
        desc = _frontmatter_value(fm, "description") or ""
        slug = file.stem
        url = f"{lang_prefix}/glossar/{slug}/"

        # Kompakt halten, damit Promptgröße nicht unnötig explodiert.
        if len(desc) > 140:
            desc = desc[:137].rstrip() + "..."

        if desc:
            entries.append(f"- {term}: {url} | {desc}")
        else:
            entries.append(f"- {term}: {url}")

    context = "\n".join(entries)
    GLOSSARY_CONTEXT_CACHE[lang] = context
    return context


def load_glossar_template(lang: str) -> str:
    """Lädt das sprachspezifische Glossar-Template aus dem Repo und cached den Inhalt."""
    if lang in GLOSSAR_TEMPLATE_CACHE:
        return GLOSSAR_TEMPLATE_CACHE[lang]

    candidates = [
        Path(f"docs/glossar-template-{lang}.md"),
        Path(f"handoff/glossar-template-{lang}.md"),
    ]

    for candidate in candidates:
        if candidate.exists():
            try:
                GLOSSAR_TEMPLATE_CACHE[lang] = candidate.read_text(encoding="utf-8").strip()
                return GLOSSAR_TEMPLATE_CACHE[lang]
            except Exception:
                continue

    GLOSSAR_TEMPLATE_CACHE[lang] = ""
    return GLOSSAR_TEMPLATE_CACHE[lang]


def build_prompt(lang: str) -> str:
    """Kombiniert Basis-Prompt mit der sprachspezifischen Glossar-Liste."""
    base = PROMPTS.get(lang, PROMPTS["en"]).strip()
    glossary_context = build_glossary_context(lang)
    template_block = ""
    template_text = load_glossar_template(lang)
    if template_text:
        if lang == "de":
            intro = (
                "Format-Referenz (Template):\n"
                "Nutze dieses Template als grobe Leitplanke für Frontmatter und Grundstruktur.\n"
                "WICHTIG: Der Markdown-Bereich ist nicht reglementiert.\n"
                "Passe Abschnitte, Reihenfolge und Tiefe pro Glossarbegriff frei an, wenn es der Qualität dient.\n"
                "Ziel: Für Leser möglichst spannend, konkret und zugleich klar SEO-optimiert schreiben.\n"
            )
        elif lang == "ru":
            intro = (
                "Format reference (template):\n"
                "Use this template as a rough guide for frontmatter and basic structure.\n"
                "IMPORTANT: The Markdown body is not strictly regulated.\n"
                "Adapt sections, order, and depth freely for each glossary term whenever it improves quality.\n"
                "Goal: make the article engaging for readers and clearly SEO-optimized.\n"
            )
        else:
            intro = (
                "Format reference (template):\n"
                "Use this template as a rough guide for frontmatter and basic structure.\n"
                "IMPORTANT: The Markdown body is not strictly regulated.\n"
                "Adapt sections, order, and depth freely for each glossary term whenever it improves quality.\n"
                "Goal: make the article engaging for readers and clearly SEO-optimized.\n"
            )

        template_block = (
            "\n\n"
            f"{intro}\n"
            "```markdown\n"
            f"{template_text}\n"
            "```"
        )

    if not glossary_context:
        return f"{base}{template_block}"

    return (
        f"{base}\n\n"
        "Verfügbare Glossareinträge für interne Verlinkung und relatedTerms:\n"
        "Verwende nur diese Einträge als interne Linkziele:\n"
        f"{glossary_context}"
        f"{template_block}"
    )

def optimize(markdown: str, client, lang: str) -> str:
    """Sendet den Markdown-Text an die Gemini API zur SEO-Optimierung mit unendlicher Retry-Logik."""
    base_delay = 10  # Start-Wartezeit in Sekunden
    max_delay = 300  # Maximal 5 Minuten (300s) warten pro Durchgang
    attempt = 0
    
    prompt = build_prompt(lang)  # Basis-Prompt + Glossar-Kontext

    while True:
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    prompt,
                    markdown
                ],
            )
            return response.text.strip()
        
        except Exception as e:
            error_msg = str(e).lower()
            # Fängt 429 (Rate Limit) und 503 (Unavailable/High Demand) ab
            if "429" in error_msg or "503" in error_msg or "unavailable" in error_msg or "quota" in error_msg:
                attempt += 1
                # Exponential Backoff, aber gedeckelt auf max_delay
                sleep_time = min(base_delay * (2 ** (attempt - 1)), max_delay)
                safe_print(f"      [Überlastet/Limit] Warte {sleep_time}s und versuche es erneut (Versuch {attempt})...")
                time.sleep(sleep_time)
            else:
                # Bei komplett anderen, unbekannten Fehlern (z.B. falscher API-Key) sofort abbrechen
                raise e


def extract_openai_response_text(response) -> str:
    """Extrahiert robust den Text aus OpenAI Responses API-Antworten."""
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    collected = []
    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            text = getattr(content, "text", None)
            if isinstance(text, str) and text.strip():
                collected.append(text.strip())

    if collected:
        return "\n\n".join(collected).strip()

    return ""


def clean_markdown_response(text: str, require_frontmatter: bool = False) -> str:
    """Entfernt optionale Markdown-Codefences um die Modellantwort."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:markdown|md)?\s*", "", cleaned, count=1, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()
    if require_frontmatter and not cleaned.startswith("---"):
        raise RuntimeError("Antwort enthält kein YAML-Frontmatter (erwartet Start mit ---).")
    return cleaned


def call_azure_openai(
    client,
    lang: str,
    user_content: str,
    deployment_name: str,
    require_frontmatter: bool = False,
) -> str:
    """Gemeinsamer Azure-OpenAI-Call (Responses API) mit Retry-Logik."""
    base_delay = 10
    max_delay = 300
    attempt = 0

    prompt = build_prompt(lang)

    while True:
        try:
            response = client.responses.create(
                model=deployment_name,
                input=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content},
                ],
            )
            text = extract_openai_response_text(response)
            if text:
                return clean_markdown_response(text, require_frontmatter=require_frontmatter)
            raise RuntimeError("Leere Antwort von Azure OpenAI erhalten.")

        except Exception as e:
            error_msg = str(e).lower()
            if (
                "429" in error_msg
                or "503" in error_msg
                or "rate limit" in error_msg
                or "quota" in error_msg
                or "temporarily unavailable" in error_msg
                or "timeout" in error_msg
            ):
                attempt += 1
                sleep_time = min(base_delay * (2 ** (attempt - 1)), max_delay)
                safe_print(f"      [Azure OpenAI Limit/Last] Warte {sleep_time}s und versuche es erneut (Versuch {attempt})...")
                time.sleep(sleep_time)
            else:
                raise e


def optimize_api(markdown: str, client, lang: str, deployment_name: str) -> str:
    """Sendet Markdown an Azure OpenAI (Responses API) zur Optimierung mit Retry-Logik."""
    return call_azure_openai(client, lang, markdown, deployment_name)


def slugify_term(term: str) -> str:
    """Erzeugt einen DE-kompatiblen Glossar-Slug (ä->ae, ö->oe, ü->ue, ß->ss)."""
    mapping = {
        "ä": "ae",
        "ö": "oe",
        "ü": "ue",
        "Ä": "ae",
        "Ö": "oe",
        "Ü": "ue",
        "ß": "ss",
        "æ": "ae",
        "œ": "oe",
    }
    slug = term.strip()
    for src, dst in mapping.items():
        slug = slug.replace(src, dst)
    slug = unicodedata.normalize("NFKD", slug)
    slug = "".join(ch for ch in slug if not unicodedata.combining(ch))
    slug = slug.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    if not slug:
        raise ValueError(f"Konnte keinen gültigen Slug aus {term!r} ableiten.")
    return slug


def parse_new_glossary_items(raw_text: str) -> list[NewGlossaryItem]:
    """Parst Zeilen im Format 'Begriff - Kurzbeschreibung'."""
    items: list[NewGlossaryItem] = []
    seen_slugs: set[str] = set()

    for line_number, raw_line in enumerate(raw_text.splitlines(), 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        match = re.match(r"^(.+?)\s+[-–—]\s+(.+)$", line)
        if not match:
            raise ValueError(
                f"Zeile {line_number}: erwartet 'NEUER_BEGRIFF - KURZBESCHREIBUNG', gefunden: {raw_line!r}"
            )

        term = match.group(1).strip()
        description = match.group(2).strip()
        if not term or not description:
            raise ValueError(f"Zeile {line_number}: Begriff und Beschreibung dürfen nicht leer sein.")

        slug = slugify_term(term)
        if slug in seen_slugs:
            raise ValueError(f"Zeile {line_number}: doppelter Slug {slug!r} in der Eingabe.")
        seen_slugs.add(slug)
        items.append(NewGlossaryItem(term=term, description=description, slug=slug))

    if not items:
        raise ValueError("Keine Glossareinträge in der Eingabe gefunden.")

    return items


def build_create_user_message(lang: str, item: NewGlossaryItem) -> str:
    """Baut die User-Nachricht für die Neuanlage eines Glossareintrags."""
    url_cfg = GLOSSARY_URLS[lang]
    url = url_cfg["url"].format(slug=item.slug)
    aliases = [alias.format(slug=item.slug) for alias in url_cfg["aliases"]]
    alias_block = "\n".join(f"  - {alias}" for alias in aliases) if aliases else "  (keine)"
    template = CREATE_USER_PROMPTS[lang]
    return template.format(
        term=item.term,
        description=item.description,
        slug=item.slug,
        url=url,
        aliases=alias_block,
        today=date.today().isoformat(),
    )


def create_api(item: NewGlossaryItem, client, lang: str, deployment_name: str) -> str:
    """Erzeugt einen neuen Glossareintrag via Azure OpenAI (gleicher LLM-Weg wie optimize-api)."""
    return call_azure_openai(
        client,
        lang,
        build_create_user_message(lang, item),
        deployment_name,
        require_frontmatter=True,
    )


def target_path_for_item(lang: str, item: NewGlossaryItem) -> Path:
    return ROOTS[lang] / f"{item.slug}.md"


def is_transient_network_error(error: Exception) -> bool:
    """Erkennt temporäre Netzwerkfehler, bei denen ein Retry sinnvoll ist."""
    msg = str(error).lower()
    markers = [
        "network is unreachable",
        "errno 51",
        "connection reset",
        "connection aborted",
        "connection refused",
        "temporary failure",
        "timed out",
        "timeout",
        "name or service not known",
        "nodename nor servname provided",
        "failed to establish a new connection",
    ]
    return any(marker in msg for marker in markers)

def process(path: Path, client, lang: str, worker_id: int, optimize_fn):
    """Verarbeitet eine einzelne Datei für die Optimierung."""
    safe_print(f"[Worker {worker_id}] → {path}")

    original = path.read_text(encoding="utf-8")

    try:
        improved = optimize_fn(original, client, lang)
    except Exception as e:
        if is_transient_network_error(e):
            safe_print(f"[Worker {worker_id}]    Netzwerkfehler bei {path}: {e}")
            return "retry"

        safe_print(f"[Worker {worker_id}]    Fehler bei {path}: {e}")
        return "done"  # Nicht-transiente Fehler gelten als final für diesen Lauf.

    if improved == original:
        safe_print(f"[Worker {worker_id}]    keine Änderungen")
        return "done"

    path.write_text(improved, encoding="utf-8")
    safe_print(f"[Worker {worker_id}]    ✔ verbessert ({lang.upper()})")
    return "done"


def process_append(item: NewGlossaryItem, client, lang: str, worker_id: int, create_fn):
    """Erzeugt einen neuen Glossareintrag und schreibt die Markdown-Datei."""
    path = target_path_for_item(lang, item)
    safe_print(f"[Worker {worker_id}] + {lang.upper()} {item.term} → {path}")

    if path.exists():
        safe_print(f"[Worker {worker_id}]    übersprungen (existiert bereits)")
        return "done"

    try:
        markdown = create_fn(item, client, lang)
    except Exception as e:
        if is_transient_network_error(e):
            safe_print(f"[Worker {worker_id}]    Netzwerkfehler bei {item.slug}/{lang}: {e}")
            return "retry"

        safe_print(f"[Worker {worker_id}]    Fehler bei {item.slug}/{lang}: {e}")
        return "done"

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(markdown + "\n", encoding="utf-8")
    GLOSSARY_CONTEXT_CACHE.pop(lang, None)
    safe_print(f"[Worker {worker_id}]    ✔ angelegt ({lang.upper()})")
    return "done"


def worker_task(task_queue: queue.Queue, client_factory, optimize_fn, worker_id: int):
    """Die Hauptaufgabe für jeden Thread: Holt Dateien aus der Queue und verarbeitet sie."""
    try:
        client = client_factory()
    except Exception as e:
        safe_print(f"[Worker {worker_id}] Fehler beim Initialisieren des Clients: {e}")
        return

    safe_print(f"[Worker {worker_id}] Gestartet.")

    while True:
        # Blockierend warten: Worker bleiben aktiv und können neue/requeued Jobs übernehmen.
        task = task_queue.get()

        try:
            if task is STOP_WORKER:
                break

            path, lang, retries = task
            result = process(path, client, lang, worker_id, optimize_fn)

            if result == "retry":
                # Datei bleibt in der Queue: bei transienten Netzwerkfehlern neu einreihen.
                next_retries = retries + 1
                task_queue.put((path, lang, next_retries))
                backoff = min(60, 2 ** min(next_retries, 6))
                safe_print(
                    f"[Worker {worker_id}]    ↻ Requeue für {path} (Retry {next_retries}, warte {backoff}s)"
                )
                time.sleep(backoff)
            else:
                if tracker:
                    tracker.update()

            # Kleine Pause gegen Rate Limits, auch mit Backoff sinnvoll, um Spitzen zu vermeiden
            time.sleep(1.5)
        except Exception as e:
            safe_print(f"[Worker {worker_id}] Unerwarteter Worker-Fehler: {e}")
        finally:
            task_queue.task_done()
        
    safe_print(f"[Worker {worker_id}] Beendet (Warteschlange leer).")


def append_worker_task(task_queue: queue.Queue, client_factory, create_fn, worker_id: int):
    """Worker für --append-api: legt neue Glossareinträge an."""
    try:
        client = client_factory()
    except Exception as e:
        safe_print(f"[Worker {worker_id}] Fehler beim Initialisieren des Clients: {e}")
        return

    safe_print(f"[Worker {worker_id}] Gestartet.")

    while True:
        task = task_queue.get()
        try:
            if task is STOP_WORKER:
                break

            item, lang, retries = task
            result = process_append(item, client, lang, worker_id, create_fn)

            if result == "retry":
                next_retries = retries + 1
                task_queue.put((item, lang, next_retries))
                backoff = min(60, 2 ** min(next_retries, 6))
                safe_print(
                    f"[Worker {worker_id}]    ↻ Requeue für {item.slug}/{lang} "
                    f"(Retry {next_retries}, warte {backoff}s)"
                )
                time.sleep(backoff)
            else:
                if tracker:
                    tracker.update()

            time.sleep(1.5)
        except Exception as e:
            safe_print(f"[Worker {worker_id}] Unerwarteter Worker-Fehler: {e}")
        finally:
            task_queue.task_done()

    safe_print(f"[Worker {worker_id}] Beendet (Warteschlange leer).")


def make_gemini_client_factory(api_key: str):
    def _factory():
        from google import genai
        return genai.Client(api_key=api_key)
    return _factory


def make_azure_openai_client_factory():
    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", AZURE_OPENAI_ENDPOINT)

    def _factory():
        from openai import OpenAI
        api_key = os.environ.get("AZURE_OPENAI_KEY", "").strip()

        if api_key:
            return OpenAI(
                base_url=endpoint,
                api_key=api_key,
            )

        from azure.identity import DefaultAzureCredential, get_bearer_token_provider

        token_provider = get_bearer_token_provider(
            DefaultAzureCredential(),
            AZURE_OPENAI_SCOPE,
        )

        return OpenAI(
            base_url=endpoint,
            api_key=token_provider,
        )

    return _factory


def run_worker_pool(task_queue: queue.Queue, worker_specs: list[tuple], optimize_fn):
    """Startet Worker-Threads, wartet auf Abschluss und beendet sauber."""
    global tracker
    tracker = ProgressTracker(task_queue.qsize())
    with print_lock:
        tracker._draw()

    threads = []
    for worker_id, client_factory in worker_specs:
        t = threading.Thread(
            target=worker_task,
            args=(task_queue, client_factory, optimize_fn, worker_id),
        )
        threads.append(t)
        t.start()

    task_queue.join()

    for _ in threads:
        task_queue.put(STOP_WORKER)
    task_queue.join()

    for t in threads:
        t.join()


def run_append_worker_pool(task_queue: queue.Queue, worker_specs: list[tuple], create_fn):
    """Startet Append-Worker, wartet auf Abschluss und beendet sauber."""
    global tracker
    tracker = ProgressTracker(task_queue.qsize())
    with print_lock:
        tracker._draw()

    threads = []
    for worker_id, client_factory in worker_specs:
        t = threading.Thread(
            target=append_worker_task,
            args=(task_queue, client_factory, create_fn, worker_id),
        )
        threads.append(t)
        t.start()

    task_queue.join()

    for _ in threads:
        task_queue.put(STOP_WORKER)
    task_queue.join()

    for t in threads:
        t.join()


def parse_languages(raw_languages: str) -> list[str]:
    """Parst CSV-Sprachliste wie 'de,en,ru' und validiert gegen konfigurierte Sprachen."""
    parts = [p.strip().lower() for p in raw_languages.split(",") if p.strip()]
    if not parts:
        raise ValueError("Leere Sprachliste. Beispiel: --language de,en,ru")

    allowed = set(ROOTS.keys())
    invalid = sorted([p for p in parts if p not in allowed])
    if invalid:
        raise ValueError(
            f"Unbekannte Sprache(n): {', '.join(invalid)}. Erlaubt sind: {', '.join(sorted(allowed))}"
        )

    # Reihenfolge beibehalten, Duplikate entfernen
    unique = list(dict.fromkeys(parts))
    return unique


def is_older_than_days(path: Path, days: int) -> bool:
    """Prüft, ob Datei-Änderungszeitpunkt älter als angegebene Tage ist."""
    if days <= 0:
        return True

    age_seconds = time.time() - path.stat().st_mtime
    return age_seconds > days * 86400


def show_overview(languages: list[str]):
    """Liest alle Markdown-Dateien aus den gewählten Sprachen aus und gibt Term und Beschreibung aus."""
    total_files = 0
    
    for lang in languages:
        root = ROOTS[lang]
        if not root.exists():
            print(f"Ordner existiert nicht: {root}")
            continue

        files = sorted(root.rglob("*.md"))
        total_files += len(files)
        print(f"\n=== GLOSSAR ÜBERSICHT {lang.upper()} ({len(files)} Einträge) ===\n")

        for file in files:
            content = file.read_text(encoding="utf-8")
            
            # Extrahiere YAML Frontmatter robuster (toleriert Leerzeichen & Windows-Umbrüche)
            match = re.search(r"^\s*---\r?\n(.*?)\r?\n---", content, re.DOTALL | re.MULTILINE)
            
            term = "Unbekannt"
            description = "Keine Beschreibung gefunden."
            
            if match:
                frontmatter = match.group(1)
                
                def get_val(key):
                    # Sucht nach key: value (erlaubt fehlende Quotes und schneidet \r ab)
                    m = re.search(rf'^{key}:\s*(.*)$', frontmatter, re.MULTILINE)
                    if m:
                        val = m.group(1).strip()
                        # Entferne umschließende Anführungszeichen (sowohl " als auch ')
                        if (val.startswith('"') and val.endswith('"')) or \
                           (val.startswith("'") and val.endswith("'")):
                            return val[1:-1].strip()
                        return val
                    return None
                    
                parsed_term = get_val("term")
                parsed_title = get_val("title")
                parsed_desc = get_val("description")
                
                if parsed_term:
                    term = parsed_term
                elif parsed_title:
                    term = parsed_title
                    
                if parsed_desc:
                    description = parsed_desc
                    
            print(f"📌 [{lang.upper()}] {term}")
            print(f"   {description}")
            print("-" * 50)
            
    print(f"\nGesamt: {total_files} Einträge in den gewählten Sprachen ({', '.join(languages)}).")

def main():
    parser = argparse.ArgumentParser(description="Verwaltet und optimiert mehrsprachige Glossareinträge.")
    parser.add_argument("--optimize", action="store_true", help="Optimiert alle Glossareinträge (SEO & Text) via Gemini API. Nutzt alle GEMINI_API_KEYs im Env.")
    parser.add_argument("--optimize-api", action="store_true", help="Optimiert alle Glossareinträge (SEO & Text) via Azure OpenAI API.")
    parser.add_argument(
        "--append-api",
        action="store_true",
        help=(
            "Legt neue Glossareinträge via Azure OpenAI an. "
            "Erwartet stdin-Zeilen im Format 'Begriff - Kurzbeschreibung'."
        ),
    )
    parser.add_argument("--overview", action="store_true", help="Gibt eine Übersicht aller Glossareinträge aus.")
    parser.add_argument(
        "--worker",
        type=int,
        default=None,
        help="Anzahl paralleler Worker für --optimize, --optimize-api oder --append-api. Standard: auto.",
    )
    parser.add_argument(
        "--language",
        default=",".join(DEFAULT_LANGUAGES),
        help="CSV-Liste der Sprachen, die analysiert/bearbeitet werden sollen (z.B. de,en,ru oder nur de). Default: de,en,ru",
    )
    parser.add_argument(
        "--older-than-days",
        type=int,
        default=0,
        help="Nur mit --optimize/--optimize-api: verarbeitet nur Dateien, deren Änderungsdatum älter als X Tage ist. 0 = kein Altersfilter (Default).",
    )
    
    args = parser.parse_args()

    try:
        selected_languages = parse_languages(args.language)
    except ValueError as e:
        parser.error(str(e))

    if args.older_than_days < 0:
        parser.error("--older-than-days darf nicht negativ sein.")

    if args.worker is not None and args.worker <= 0:
        parser.error("--worker muss eine Zahl > 0 sein.")

    mode_flags = [args.optimize, args.optimize_api, args.append_api]
    if sum(1 for flag in mode_flags if flag) > 1:
        parser.error("Bitte nur einen Modus wählen: --optimize, --optimize-api oder --append-api.")

    # Wenn keine Argumente übergeben wurden, zeige die Hilfe an
    if not (args.optimize or args.optimize_api or args.append_api or args.overview):
        parser.print_help()
        return

    if args.overview:
        show_overview(selected_languages)

    if args.append_api:
        if sys.stdin.isatty():
            parser.error(
                "Für --append-api Einträge per Pipe übergeben, z.B.: "
                "cat new_glossary_items.txt | ./glossary.py --append-api"
            )

        try:
            new_items = parse_new_glossary_items(sys.stdin.read())
        except ValueError as e:
            parser.error(str(e))

        task_queue = queue.Queue()
        skipped_existing = 0

        for item in new_items:
            for lang in selected_languages:
                path = target_path_for_item(lang, item)
                if path.exists():
                    skipped_existing += 1
                    print(f"Überspringe bestehende Datei: {path}")
                    continue
                task_queue.put((item, lang, 0))

        print(
            f"{len(new_items)} Begriff(e) gelesen. "
            f"{task_queue.qsize()} Datei(en) anzulegen "
            f"({skipped_existing} bereits vorhanden übersprungen).\n"
        )

        if task_queue.qsize() == 0:
            print("Keine neuen Dateien zu erzeugen.")
            return

        deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT", AZURE_OPENAI_DEPLOYMENT)
        endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", AZURE_OPENAI_ENDPOINT)
        default_workers = 4
        worker_count = args.worker if args.worker is not None else default_workers
        worker_count = min(worker_count, max(1, task_queue.qsize()))

        print(f"Azure OpenAI Endpoint: {endpoint}")
        print(f"Azure OpenAI Deployment: {deployment_name}")
        print(f"Starte {worker_count} Worker für --append-api...\n")

        def create_api_bound(item: NewGlossaryItem, client, lang: str) -> str:
            return create_api(item, client, lang, deployment_name)

        worker_specs = [(i + 1, make_azure_openai_client_factory()) for i in range(worker_count)]
        run_append_worker_pool(task_queue, worker_specs, create_api_bound)
        print(
            f"\n\n🎉 Azure-OpenAI-Neuanlage für folgende Sprachen abgeschlossen: "
            f"{', '.join(selected_languages)}"
        )
        return

    if args.optimize or args.optimize_api:
        task_queue = queue.Queue()
        skipped_by_age = 0

        # Fülle die Warteschlange mit Aufgaben
        for lang in selected_languages:
            root = ROOTS[lang]
            if not root.exists():
                print(f"Warnung: Ordner existiert nicht, wird übersprungen: {root}")
                continue
                
            files = sorted(root.rglob("*.md"))
            for file in files:
                if is_older_than_days(file, args.older_than_days):
                    task_queue.put((file, lang, 0))
                else:
                    skipped_by_age += 1
                
        print(f"Insgesamt {task_queue.qsize()} Dateien in die Warteschlange gestellt.\n")
        if args.older_than_days > 0:
            print(f"Altersfilter aktiv: älter als {args.older_than_days} Tag(e). Übersprungen: {skipped_by_age} Datei(en).\n")
        
        if task_queue.qsize() == 0:
            print("Keine Dateien zu verarbeiten.")
            return

        if args.optimize:
            api_keys = get_api_keys()
            if not api_keys:
                print("Abbruch: Keine API Keys (GEMINI_API_KEY_*) in den Umgebungsvariablen gefunden.")
                return

            default_workers = len(api_keys)
            worker_count = args.worker if args.worker is not None else default_workers
            worker_count = min(worker_count, max(1, task_queue.qsize()))

            print(f"{len(api_keys)} Gemini API-Key(s) gefunden. Starte {worker_count} Worker...\n")

            worker_specs = []
            for i in range(worker_count):
                key = api_keys[i % len(api_keys)]
                worker_specs.append((i + 1, make_gemini_client_factory(key)))

            run_worker_pool(task_queue, worker_specs, optimize)
            print(f"\n\n🎉 Gemini-Optimierung für folgende Sprachen abgeschlossen: {', '.join(selected_languages)}")

        if args.optimize_api:
            deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT", AZURE_OPENAI_DEPLOYMENT)
            endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", AZURE_OPENAI_ENDPOINT)

            default_workers = 4
            worker_count = args.worker if args.worker is not None else default_workers
            worker_count = min(worker_count, max(1, task_queue.qsize()))

            print(f"Azure OpenAI Endpoint: {endpoint}")
            print(f"Azure OpenAI Deployment: {deployment_name}")
            print(f"Starte {worker_count} Worker für --optimize-api...\n")

            def optimize_api_bound(markdown: str, client, lang: str) -> str:
                return optimize_api(markdown, client, lang, deployment_name)

            worker_specs = [(i + 1, make_azure_openai_client_factory()) for i in range(worker_count)]
            run_worker_pool(task_queue, worker_specs, optimize_api_bound)
            print(f"\n\n🎉 Azure-OpenAI-Optimierung für folgende Sprachen abgeschlossen: {', '.join(selected_languages)}")

if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # Erlaubt sauberes Beenden bei gepipter Ausgabe, z.B. '| head'.
        try:
            sys.stdout.close()
        except Exception:
            pass