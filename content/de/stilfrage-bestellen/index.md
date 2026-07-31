---
title: "Stilfrage bestellen"
seoTitle: "Stilfrage bestellen | Ablauf & Buchung | ESKYNA"
description: "Buche deine Stilfrage verbindlich: nach dem Einreichen wählst du Stilantwort per Foto oder Live-Shopping-Check und zahlst sicher über Stripe."
layout: single
url: /stilfrage/bestellen/

back:
  href: /stilfrage/
  label: Zur Stilfrage

order:
  kicker: ESKYNA Stilfrage
  headline: "Klarheit, die du spürst."
  lead: "Du hast deine Stilfrage eingereicht. Als Nächstes wählst du das passende Format und sicherst dir Natalias Einschätzung verbindlich."
  price: "ab 49 €"
  price_note: "je nach Format"
  secondary_cta:
    href: /stilfrage/
    text: Frage zuerst einreichen
  checkout_kicker: Verbindliche Buchung
  checkout_title: "Wähle dein Format"
  checkout_text: "Zwei klare Wege zur Entscheidung. Die Zahlung erfolgt sicher über Stripe."
  fallback_cta:
    href: /stilfrage/
    text: Noch keine Frage eingereicht? Hier starten

options:
  title: Deine beiden Möglichkeiten
  intro: "Wähle das Format, das zu deinem Moment passt."
  items:
    - id: foto
      title: Stilantwort per Foto / Nachricht
      price: ab 49 €
      text: "Du hast bereits Frage, Foto oder Auswahlmöglichkeiten gesendet. Natalia antwortet mit einer klaren Einschätzung und kurzer Begründung."
      includes:
        - Persönliche Antwort zu deiner konkreten Frage
        - Einschätzung zu Farbe, Schnitt, Proportion, Stil oder Wirkung
        - Klare Empfehlung: kaufen, behalten, anders kombinieren oder lieber lassen
        - Kurze Erklärung, warum etwas funktioniert oder nicht
      stripe:
        enabled: false
        checkout_url: ""
        button_text: "Stilantwort buchen"
    - id: live
      title: Live-Shopping-Check
      price: ab 79 €
      text: "Für den Moment im Laden oder vor dem Kauf: Natalia schaut live mit und hilft dir, sicher zu entscheiden."
      note: "Nach Verfügbarkeit und mit vorher gebuchtem Zeitfenster."
      includes:
        - Kurze Live-Beratung per Video oder Call
        - Einschätzung zu Teilen, die du gerade anprobierst
        - Direkte Entscheidungshilfe
        - Hinweise, worauf du beim Kauf achten solltest
      stripe:
        enabled: false
        checkout_url: ""
        button_text: "Live-Check buchen"

stripe:
  enabled: false
  pending_text: "Die sichere Stripe-Buchung wird in Kürze freigeschaltet."
  secure_note: "Sichere Zahlung über Stripe. Du erhältst danach alle Details per E-Mail."

process:
  title: So läuft deine Stilfrage ab
  intro: "Fünf klare Schritte. Du weißt jederzeit, wo du stehst und was als Nächstes kommt."
  steps:
    - title: Stilfrage einreichen
      status: done
      status_label: Abgeschlossen
      text: "Deine Stilfrage ist per E-Mail bei Natalia eingegangen. Damit ist der Ausgangspunkt klar."
    - title: Format wählen und bezahlen
      status: current
      status_label: Als Nächstes
      text: "Sichere dir verbindlich Natalias Einschätzung. Du wählst zwischen Stilantwort per Foto / Nachricht und dem Live-Shopping-Check."
      show_options: true
    - title: Natalia nimmt deine Anfrage auf
      text: "Nach der Bezahlung kannst du deine Anfrage ergänzen, um Fotos / Details. Natalia arbeitet deine Anfrage aus, oder dein Live-Zeitfenster wird bestätigt."
      links:
        - href: "mailto:natalia@eskyna.com?subject=Ergänzung%20zu%20meiner%20Stilfrage"
          label: Ergänzung per E-Mail senden
        - enabled: false
          href: "https://t.me/Natalia_Klee"
          label: Live über Telegram
          pending_label: Live über Telegram gibt es nach der Bezahlung
    - title: Klare Einschätzung
      text: "Du erhältst eine konkrete Empfehlung mit Begründung, schriftlich oder live im Gespräch."
    - title: Sichere Entscheidung
      text: "Dann weißt du, was zu dir passt, und kannst ruhig entscheiden: kaufen, behalten oder lieber lassen."

assurance:
  title: Warum Kundinnen diesen Weg wählen
  text: "Weil gute Stilentscheidungen selten in der Umkleide allein entstehen. Sie entstehen im Dialog."
  items:
    - title: Persönlich
      text: "Natalia antwortet nicht pauschal, sondern auf deine Situation, deinen Körper und deinen Alltag."
    - title: Verbindlich
      text: "Du buchst ein klares Format mit Preis, nicht nur eine Nachricht ins Leere."
    - title: Elegant ruhig
      text: "Kein Druck, kein Trendgetöse. Stattdessen Klarheit, die dich sicherer entscheiden lässt."
---
