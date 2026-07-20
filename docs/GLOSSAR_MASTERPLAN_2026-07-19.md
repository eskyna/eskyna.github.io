# Glossar Masterplan 2026-07-19

Status: verbindliche Arbeitsgrundlage
Quelle: Briefingstand 19.07.2026

## Zweck

Dieses Dokument operationalisiert den freigegebenen Glossar-Plan für Redaktion, SEO, Entwicklung, Design, Lektorat, QA und Reporting.

## Priorisierte Reihenfolge

1. Phase 0 abschließen: Technik, Taxonomie, CMS-Felder, URL-Regeln, Linkregeln, QA-Gates.
2. Welle 1 (P0): 32 Grundlagenbegriffe clusterweise umsetzen.
3. Welle 2 (P1): Ausbau mit Suchvarianten und Beratungsfragen.
4. Welle 3 (P2): Vertiefung daten- und bedarfsbasiert.

## Verbindliche Publikations-Gates pro Begriff

- Dubletten- und Synonymcheck gegen A-Z-Index.
- Seitentyp bestätigt: Hub, Standardartikel, Alias/Abgrenzung, Redirect, Vergleich.
- Quellenlage dokumentiert und fachlich belastbar.
- Interne Links gesetzt: 4-8 ausgehend, mindestens 2 eingehend.
- Fachfreigabe Natalia Kleemann dokumentiert.
- Lektorat abgeschlossen.
- Technische Abnahme bestanden: Canonical, Breadcrumb, Indexierbarkeit, Status, Redirects.

## Phase 0: Ticket-Board (20)

Legende: `todo`, `in-progress`, `blocked`, `done`

Verbindliche Arbeitsliste: [docs/GLOSSAR_PHASE0_TASKLIST_2026-07-20.md](docs/GLOSSAR_PHASE0_TASKLIST_2026-07-20.md)

### P0 vor Skalierung fertig

- [ ] T01 CMS-Export komplett (`todo`)
- [ ] T02 Re-Tagging aller 709 Begriffe (`todo`)
- [ ] T03 Kategorie Dresscodes korrigieren (`todo`)
- [ ] T04 Kategorie Kleider und Röcke korrigieren (`todo`)
- [ ] T05 Kategorie Schuhe korrigieren (`todo`)
- [ ] T06 Neue Kategorien + Eltern-Kind-Struktur (`todo`)
- [ ] T07 Synonym- und Alias-Logik im CMS (`todo`)
- [ ] T08 Slug- und Redirect-Regeln (`todo`)
- [ ] T09 A-Z-Fehlmeldung nur bei leerem Ergebnis (`todo`)
- [ ] T11 Boilerplate- und Wiederholungs-Audit (`todo`)
- [ ] T13 Einheitliches Content-Modell im CMS (`todo`)
- [ ] T14 Kontextuelle Verlinkungsregeln (`todo`)
- [ ] T17 Autorin/Fachprüfung/Aktualisierungsdatum sichtbar (`todo`)

### Parallel danach

- [ ] T10 Related-Block bereinigen (`todo`)
- [ ] T12 Lektoratsstandard vereinheitlichen (`todo`)
- [ ] T15 Breadcrumb + BreadcrumbList (`todo`)
- [ ] T16 DefinedTerm Test (optional) (`todo`)
- [ ] T18 Barrierefreiheit Alt/H/Linktexte (`todo`)
- [ ] T19 Sitemap/Canonical/Indexmonitoring (`todo`)
- [ ] T20 Dashboard und Monatsreview (`todo`)

## Welle 1: P0-Begriffe (32)

- Block A Farbe/Stil: G001, G006, G007, G008, G015
- Block B Größe/Passform: G016, G017, G018, G019, G020, G022, G026, G027, G028, G034, G035
- Block C Accessoires/Anlass/Schuhe: G036, G042, G046, G051
- Block D Wäsche/Pflege/Verbraucherwissen: G054, G058, G059, G064, G065, G079, G081, G090, G093, G096, G104, G105

## Erster Umsetzungssprint (verbindlich)

1. T01-T06 abschließen und dokumentieren.
2. T07-T17 technisch testen (CMS-Felder, Status, Alias, Slugs, Links, Freigabe).
3. Pilotartikel komplett produzieren.
   - Konfektionsgröße
   - 12-Jahreszeiten-System
   - Handtasche
   - Waschen
4. Für jeden Pilot mindestens eine Rückverlinkung aus bestehender Seite setzen.
5. Technische und redaktionelle Abnahme durchführen.
6. Learnings in Template und Workflow übernehmen.

## Seitentyp- und URL-Regeln

- Muster: `/glossar/<slug>/`
- Slugs klein, ASCII, Bindestriche.
- Umlautregeln: `ae`, `oe`, `ue`, `ss`.
- Genau eine kanonische URL je Begriff.
- Jede URL-Änderung mit direkter 301.
- Redirect-Ketten = 0.

## Verbindliche Qualitätsstandards pro Seite

- Struktur mit Definition, Einfach-erklärt, Relevanz, Praxischeck, Fehler, Abgrenzung, FAQ, Quellen.
- Keine Boilerplate und keine wertende Körpersprache.
- Mindestens ein konkretes Entscheidungsbeispiel.
- Pflichtfelder in CMS: Slug, Title, Description, Kategorie, Synonyme, Canonical, Bild, Alt-Text, Autor/Fachprüfung, Linkstatus.

## Reporting-Rhythmus

- Monatlich: Produktion, Technik, Nutzung, CTA-Klicks, Fehler.
- Quartalsweise: Priorisierung, Linknetz, schwache Seiten.
- Halbjährlich: Fakten- und Quellencheck P0/P1.

## Kick-off-Entscheidungen (Gate)

- Rollenrechte für Priorisierung und Veröffentlichung.
- Pflichtfelder und Statusfluss im CMS.
- Schreibregeln für Gendern, Umlaute, Markennamen.
- Sichtbarkeit von Quellen, Prüfdatum, Fachfreigabe.
- CTA-Zuordnung je Cluster.
- Analytics/Search-Console-Zugänge.

## Arbeitsweise im Repo

- Vor jedem neuen Begriff: Dublettencheck gegen A-Z.
- Clusterweise arbeiten: Hub zuerst, dann Unterbegriffe, dann Rückverlinkung.
- Pro 12-16 Veröffentlichungen: Qualitäts- und Datenreview.

## Verlinkte Referenzen

- Bestandsindex: <https://eskyna.com/glossar/>
- A-Z-Liste: <https://eskyna.com/glossar/alle-begriffe/>
- Google Helpful Content: <https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=de>
- Crawlbare Links: <https://developers.google.com/search/docs/crawling-indexing/links-crawlable>
- Breadcrumbs: <https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=de>
- Schema DefinedTerm: <https://schema.org/DefinedTerm>
- Hohenstein Passform/Größen: <https://www.hohenstein.de/de/kompetenz/passform/konfektionsgroessen>
- GINETEX Pflegesymbole: <https://ginetex.de/pflegekennzeichnung/pflegesymbole/>
- GOTS: <https://global-standard.org/the-standard?layout=%2A>
- OEKO-TEX STANDARD 100: <https://www.oeko-tex.com/de/unsere-standards/oeko-tex-standard-100>
- EUR-Lex 1007/2011: <https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32011R1007>
- WAI Images: <https://www.w3.org/WAI/tutorials/images/>
- WCAG Link Purpose: <https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html>
