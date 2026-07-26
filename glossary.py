#!/usr/bin/env python3
import os
import re
import time
import argparse
import sys
import threading
import queue
from pathlib import Path

# --------------------------------------------------------
# Konfiguration
# --------------------------------------------------------

MODEL = "gemini-3.5-flash"

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

# --------------------------------------------------------
# Threading & UI Setup
# --------------------------------------------------------

# Sperre, damit die Prints der Worker sich nicht überschneiden
print_lock = threading.Lock()
tracker = None

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

        # Kompakt halten, damit Promptgroesse nicht unnoetig explodiert.
        if len(desc) > 140:
            desc = desc[:137].rstrip() + "..."

        if desc:
            entries.append(f"- {term}: {url} | {desc}")
        else:
            entries.append(f"- {term}: {url}")

    context = "\n".join(entries)
    GLOSSARY_CONTEXT_CACHE[lang] = context
    return context


def build_prompt(lang: str) -> str:
    """Kombiniert Basis-Prompt mit der sprachspezifischen Glossar-Liste."""
    base = PROMPTS.get(lang, PROMPTS["en"]).strip()
    glossary_context = build_glossary_context(lang)
    if not glossary_context:
        return base

    return (
        f"{base}\n\n"
        "Verfügbare Glossareintraege fuer interne Verlinkung und relatedTerms:\n"
        "Verwende nur diese Einträge als interne Linkziele:\n"
        f"{glossary_context}"
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

def process(path: Path, client, lang: str, worker_id: int):
    """Verarbeitet eine einzelne Datei für die Optimierung."""
    safe_print(f"[Worker {worker_id}] → {path}")

    original = path.read_text(encoding="utf-8")

    try:
        improved = optimize(original, client, lang)
    except Exception as e:
        safe_print(f"[Worker {worker_id}]    Fehler bei {path}: {e}")
        return # Bei Fehler Datei abbrechen, Worker kann aber nächste nehmen

    if improved == original:
        safe_print(f"[Worker {worker_id}]    keine Änderungen")
        return

    path.write_text(improved, encoding="utf-8")
    safe_print(f"[Worker {worker_id}]    ✔ verbessert ({lang.upper()})")

def worker_task(task_queue: queue.Queue, api_key: str, worker_id: int):
    """Die Hauptaufgabe für jeden Thread: Holt Dateien aus der Queue und verarbeitet sie."""
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
    except Exception as e:
        safe_print(f"[Worker {worker_id}] Fehler beim Initialisieren des Clients: {e}")
        return

    safe_print(f"[Worker {worker_id}] Gestartet.")

    while not task_queue.empty():
        try:
            # Holt die nächste Datei. block=False, da die Queue zu Beginn komplett gefüllt wird.
            path, lang = task_queue.get(block=False)
        except queue.Empty:
            break

        process(path, client, lang, worker_id)
        
        # Kleine Pause gegen Rate Limits, auch mit Backoff sinnvoll, um Spitzen zu vermeiden
        time.sleep(1.5)
        
        if tracker:
            tracker.update()
        
        task_queue.task_done()
        
    safe_print(f"[Worker {worker_id}] Beendet (Warteschlange leer).")

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
    """Prueft, ob Datei-Aenderungszeitpunkt aelter als angegebene Tage ist."""
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
    parser.add_argument("--overview", action="store_true", help="Gibt eine Übersicht aller Glossareinträge aus.")
    parser.add_argument(
        "--language",
        default=",".join(DEFAULT_LANGUAGES),
        help="CSV-Liste der Sprachen, die analysiert/bearbeitet werden sollen (z.B. de,en,ru oder nur de). Default: de,en,ru",
    )
    parser.add_argument(
        "--older-than-days",
        type=int,
        default=0,
        help="Nur mit --optimize: verarbeitet nur Dateien, deren Änderungsdatum älter als X Tage ist. 0 = kein Altersfilter (Default).",
    )
    
    args = parser.parse_args()

    try:
        selected_languages = parse_languages(args.language)
    except ValueError as e:
        parser.error(str(e))

    if args.older_than_days < 0:
        parser.error("--older-than-days darf nicht negativ sein.")

    # Wenn keine Argumente übergeben wurden, zeige die Hilfe an
    if not (args.optimize or args.overview):
        parser.print_help()
        return

    if args.overview:
        show_overview(selected_languages)

    if args.optimize:
        api_keys = get_api_keys()
        if not api_keys:
            print("Abbruch: Keine API Keys (GEMINI_API_KEY_*) in den Umgebungsvariablen gefunden.")
            return
            
        print(f"{len(api_keys)} API-Key(s) gefunden. Richte Worker ein...\n")

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
                    task_queue.put((file, lang))
                else:
                    skipped_by_age += 1
                
        print(f"Insgesamt {task_queue.qsize()} Dateien in die Warteschlange gestellt.\n")
        if args.older_than_days > 0:
            print(f"Altersfilter aktiv: älter als {args.older_than_days} Tag(e). Übersprungen: {skipped_by_age} Datei(en).\n")
        
        if task_queue.qsize() == 0:
            print("Keine Dateien zu verarbeiten.")
            return

        global tracker
        tracker = ProgressTracker(task_queue.qsize())
        with print_lock:
            tracker._draw()

        threads = []
        for i, key in enumerate(api_keys):
            t = threading.Thread(target=worker_task, args=(task_queue, key, i+1))
            threads.append(t)
            t.start()

        # Warte, bis die Queue leer ist und alle Tasks als "done" markiert wurden
        task_queue.join()
        
        # Warte, bis alle Threads sich beendet haben
        for t in threads:
            t.join()

        print(f"\n\n🎉 Optimierung für folgende Sprachen abgeschlossen: {', '.join(selected_languages)}")

if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # Erlaubt sauberes Beenden bei gepipter Ausgabe, z.B. '| head'.
        try:
            sys.stdout.close()
        except Exception:
            pass