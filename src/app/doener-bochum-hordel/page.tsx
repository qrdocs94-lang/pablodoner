import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Hordel | Smile Döner – Dein Döner-Service",
  description:
    "Döner in Hordel bestellen – Smile Döner Bochum liefert frischen Döner nach Hordel. Türkische Küche, faire Preise, schnelle Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Hordel | Smile Döner"
      bodyText="Hordel bekommt mit Smile Döner Bochum einen Lieferservice, auf den man sich verlassen kann. Frischer Döner, ehrliche Zutaten und schnelle Lieferzeiten – das ist unser Versprechen an alle Bewohner von Hordel. Unser Döner wird nach traditionellem türkischem Rezept zubereitet: Das Fleisch marinieren wir selbst, der Spieß dreht sich täglich, und wir schneiden erst ab, wenn deine Bestellung eingeht. Das garantiert maximale Frische und den unvergleichlichen Geschmack eines echten Döners. Neben dem Standarddöner bieten wir Hähnchendöner für alle, die leichteres Fleisch bevorzugen, sowie Dürüm, Lahmacun und Falafel für Abwechslung im Menü. Snacks, Getränke und Beilagen runden das Angebot ab. Die Online-Bestellung für Hordel ist unkompliziert: Seite aufrufen, Menü erkunden, bestellen. Bezahlen per Karte direkt beim Checkout. Lieferung folgt in kurzer Zeit. Smile Döner – Hordels frischer Lieblingslieferant."
      distanceText="Nur 7 Minuten von Hordel"
      keyword="Döner Hordel"
    />
  );
}
