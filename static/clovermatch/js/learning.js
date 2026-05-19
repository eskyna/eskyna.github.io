/**
 * Lern- und Nutzentexte: warum das Spiel inhaltlich sinnvoll ist.
 */

export const INTRO_COPY = {
  lead: "In wenigen Minuten trainieren Sie, wie echte Stil-Entscheidungen funktionieren: nicht nach Trend oder Rabatt, sondern nach dem ESKYNA-Kleeblatt – Farbe, Form, Wirkung und Alltag. Fehlkäufe erkennen Sie bewusst im Style-Filter.",
  claim:
    "Sie lernen ein System, das Sie morgens, beim Shoppen und vor dem nächsten Kauf sofort anwenden können.",
};

export const LEARN_POINTS = [
  {
    title: "Entscheidungs-System statt Bauchgefühl",
    text: "Sie üben, jedes Stil-Signal einem der vier Kleeblatt-Blätter zuzuordnen – die Grundlage für EStyle und Ihre persönliche Stil-Matrix.",
  },
  {
    title: "Schneller erkennen, was wirklich passt",
    text: "Farbe, Schnitt, Wirkung und Alltagstauglichkeit werden getrennt gedacht. So fällt die Outfit-Wahl leichter.",
  },
  {
    title: "Fehlkäufe früh stoppen",
    text: "Sale, Trends und „Must-haves“ trainieren Sie im Style-Filter auszusortieren – bevor sie im Schrank landen.",
  },
  {
    title: "Garderobe als System verstehen",
    text: "Balance und Kombinierbarkeit werden spürbar. Sie sehen, welche Bereiche Sie schon sicher beherrschen – und wo noch Lücken sind.",
  },
];

export const LEVEL_LEARNING = [
  {
    practice: "Die vier Blätter unterscheiden und Signale sicher zuordnen.",
    takeaway:
      "Sie haben die Sprache des Kleeblatts verinnerlicht – die Basis für jede weitere Stil-Entscheidung.",
  },
  {
    practice:
      "Unter Zeitdruck Prioritäten setzen: Was zählt zuerst – Farbe, Form, Wirkung oder Alltag?",
    takeaway:
      "Stil-Klarheit wächst, wenn Sie nicht alles gleichzeitig optimieren, sondern das Richtige zuerst.",
  },
  {
    practice: "Alle vier Bereiche gleichmäßig bedenken – nicht nur Ihre Lieblingskategorie.",
    takeaway:
      "Ausgewogene Signale bedeuten: Ihr Kleiderschrank funktioniert in mehr Situationen, nicht nur in einer.",
  },
  {
    practice: "Kaufimpulse erkennen, bevor sie zur Entscheidung werden.",
    takeaway:
      "Wer Fehlkäufe filtert, spart Geld, Platz und morgens die Suche nach dem „richtigen“ Teil.",
  },
  {
    practice: "Alles verbinden: Serien, Kombination und Klarheit unter Druck.",
    takeaway:
      "Sie denken Stil in Systemen – bereit, das mit EStyle dauerhaft auf Ihre Garderobe zu übertragen.",
  },
];

/**
 * @param {number} levelIndex
 * @param {boolean} won
 * @param {{ clarity: number, counts: object, campaignScore: number, mistakes: number }} stats
 */
export function buildEvaluationMessage(levelIndex, won, stats, opts = {}) {
  const learn = LEVEL_LEARNING[levelIndex] || LEVEL_LEARNING[0];
  const lv = levelIndex + 1;
  const allDone = won && levelIndex >= LEVEL_LEARNING.length - 1;

  if (won && allDone) {
    return (
      "Sie haben alle fünf Level mit " +
      stats.campaignScore +
      " Punkten abgeschlossen. " +
      learn.takeaway +
      " Mit EStyle wird aus Ihrem Spielprofil eine persönliche Stil-Matrix – für Kauf, Kombination und Auftritt."
    );
  }

  if (won) {
    let msg =
      "Level " +
      lv +
      " geschafft (+" +
      opts.bonus +
      " Bonus-Punkte" +
      (opts.perfect ? ", ohne Fehler" : "") +
      "). Stil-Klarheit: " +
      stats.clarity +
      "%. ";
    msg += learn.takeaway;
    return msg;
  }

  let msg = (opts.failMsg || "Level nicht geschafft.") + " ";
  msg += "Geübt wurde: " + learn.practice + " ";
  if (stats.clarity > 0) {
    msg +=
      "Ihre aktuelle Stil-Klarheit: " +
      stats.clarity +
      "% – jeder Versuch schärft das Gefühl für das Kleeblatt.";
  } else {
    msg += "Lesen Sie Facette und Untertitel – sie verraten oft das richtige Blatt.";
  }
  return msg;
}

/** Coach-Einstieg pro Level mit Lernfokus. */
export function levelCoachIntro(levelIndex, levelName, hint) {
  const learn = LEVEL_LEARNING[levelIndex];
  if (!learn) return "Level " + (levelIndex + 1) + ": " + hint;
  return "Level " + (levelIndex + 1) + " · " + levelName + ": " + learn.practice + " " + hint;
}
