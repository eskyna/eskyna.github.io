#!/usr/bin/env python3
import os
import re
import time
import argparse
import sys
import threading
import queue
from pathlib import Path

from google import genai

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

# Sprachspezifische Prompts
PROMPTS = {
    "de": """
Du bist Modehistoriker, Textredakteur und SEO-Experte.
Du erhältst einen Glossareintrag als Markdown.
Deine Aufgabe ist es, den Artikel erheblich zu verbessern und hochgradig SEO-freundlich auf Deutsch zu formulieren.
Optimiere den Text für Suchmaschinen (Lesefluss, organische Keyword-Nutzung, packende Formulierungen, 
klare semantische Struktur), ohne die fachliche Tiefe zu verlieren.

Verbessere:
- SEO-Fokus (Relevanz, Suchintention, Keyword-Platzierung)
- Grammatik
- Rechtschreibung
- Lesbarkeit
- Stil
- Struktur
- Verständlichkeit

Ergänze wenn sinnvoll:
- Herkunft des Begriffs
- Geschichte
- Besonderheiten
- Interessante Fakten
- Materialien
- Typische Verwendung
- Verwandte Begriffe
- Wissenswertes
- Modehistorische Einordnung

Wichtig:
- Keine Informationen erfinden.
- Ergänze nur allgemein bekannte Fakten.
- Erhalte den Markdown vollständig.
- Überschriften nicht ändern.
- Tabellen nicht ändern.
- Bilder nicht ändern.
- Links nicht ändern.
- Frontmatter nicht verändern.
- Codeblöcke nicht verändern.

Antwort ausschließlich mit dem vollständigen überarbeiteten Markdown.
Keine Erklärungen.
""",

    "en": """
You are a fashion historian, text editor, and SEO expert.
You will receive a glossary entry in Markdown.
Your task is to significantly improve the article and make it highly SEO-friendly in English.
Optimize the text for search engines (reading flow, organic keyword usage, engaging phrasing, 
clear semantic structure) without losing technical depth.

Improve:
- SEO focus (relevance, search intent, keyword placement)
- Grammar
- Spelling
- Readability
- Style
- Structure
- Comprehensibility

Add if appropriate:
- Origin of the term
- History
- Special features
- Interesting facts
- Materials
- Typical usage
- Related terms
- Trivia
- Fashion history context

Important:
- Do not invent information.
- Only add commonly known facts.
- Keep the Markdown intact completely.
- Do not change headings.
- Do not change tables.
- Do not change images.
- Do not change links.
- Do not change the frontmatter.
- Do not change code blocks.

Respond exclusively with the completely revised Markdown.
No explanations.
""",

    "ru": """
Вы историк моды, текстовый редактор и SEO-эксперт.
Вы получаете словарную статью в формате Markdown.
Ваша задача — значительно улучшить статью и сделать ее максимально SEO-оптимизированной на русском языке.
Оптимизируйте текст для поисковых систем (удобство чтения, органичное использование ключевых слов, привлекательные формулировки, 
четкая семантическая структура) без потери профессиональной глубины.

Улучшите:
- SEO-фокус (релевантность, поисковое намерение, размещение ключевых слов)
- Грамматику
- Орфографию
- Читабельность
- Стиль
- Структуру
- Понятность

Добавьте, если это уместно:
- Происхождение термина
- Историю
- Особенности
- Интересные факты
- Материалы
- Типичное использование
- Связанные термины
- Познавательную информацию
- Контекст истории моды

Важно:
- Не выдумывайте информацию.
- Добавляйте только общеизвестные факты.
- Полностью сохраните Markdown.
- Не изменяйте заголовки.
- Не изменяйте таблицы.
- Не изменяйте изображения.
- Не изменяйте ссылки.
- Не изменяйте frontmatter (метаданные).
- Не изменяйте блоки кода.

Отвечайте исключительно полным пересмотренным Markdown.
Никаких объяснений.
"""
}

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

def optimize(markdown: str, client: genai.Client, lang: str) -> str:
    """Sendet den Markdown-Text an die Gemini API zur SEO-Optimierung mit unendlicher Retry-Logik."""
    base_delay = 10  # Start-Wartezeit in Sekunden
    max_delay = 300  # Maximal 5 Minuten (300s) warten pro Durchgang
    attempt = 0
    
    prompt = PROMPTS.get(lang, PROMPTS["en"]) # Fallback auf EN falls Sprache unbekannt

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

def process(path: Path, client: genai.Client, lang: str, worker_id: int):
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

def show_overview():
    """Liest alle Markdown-Dateien aus allen konfigurierten Sprachen aus und gibt Term und Beschreibung aus."""
    total_files = 0
    
    for lang, root in ROOTS.items():
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
            
    print(f"\nGesamt: {total_files} Einträge in allen Sprachen.")

def main():
    parser = argparse.ArgumentParser(description="Verwaltet und optimiert mehrsprachige Glossareinträge.")
    parser.add_argument("--optimize", action="store_true", help="Optimiert alle Glossareinträge (SEO & Text) via Gemini API. Nutzt alle GEMINI_API_KEYs im Env.")
    parser.add_argument("--overview", action="store_true", help="Gibt eine Übersicht aller Glossareinträge aus.")
    
    args = parser.parse_args()

    # Wenn keine Argumente übergeben wurden, zeige die Hilfe an
    if not (args.optimize or args.overview):
        parser.print_help()
        return

    if args.overview:
        show_overview()

    if args.optimize:
        api_keys = get_api_keys()
        if not api_keys:
            print("Abbruch: Keine API Keys (GEMINI_API_KEY_*) in den Umgebungsvariablen gefunden.")
            return
            
        print(f"{len(api_keys)} API-Key(s) gefunden. Richte Worker ein...\n")

        task_queue = queue.Queue()
        
        # Fülle die Warteschlange mit Aufgaben
        for lang, root in ROOTS.items():
            if not root.exists():
                print(f"Warnung: Ordner existiert nicht, wird übersprungen: {root}")
                continue
                
            files = sorted(root.rglob("*.md"))
            for file in files:
                task_queue.put((file, lang))
                
        print(f"Insgesamt {task_queue.qsize()} Dateien in die Warteschlange gestellt.\n")
        
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

        print("\n\n🎉 Optimierung in allen Sprachen abgeschlossen.")

if __name__ == "__main__":
    main()