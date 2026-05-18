import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Wattenscheid | Smile Döner Bochum – Schnelle Lieferung",
  description:
    "Döner aus Wattenscheid bestellen – Smile Döner Bochum liefert frischen Döner vom Spieß zu dir. Frische Zutaten, faire Preise, einfache Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Wattenscheid | Smile Döner Bochum"
      bodyText="Aus Wattenscheid einen richtig guten Döner bestellen? Smile Döner Bochum liefert dir frisch zubereiteten Döner direkt an die Haustür. In nur wenigen Minuten Fahrzeit bringen wir dir das volle Geschmackserlebnis der türkischen Küche: zartes Fleisch vom rotierenden Spieß, frische Salate, Tomaten, Zwiebeln und unsere unverwechselbaren Saucen. Alle Zutaten werden täglich frisch geliefert und vor Ort verarbeitet – du schmeckst den Unterschied. Neben dem klassischen Döner im Fladenbrot findest du bei uns auch Dürüm, Lahmacun, Falafel und knusprige Snacks. Die Bestellung läuft komplett online: Menü aufrufen, zusammenstellen, bezahlen – fertig. Kein langes Warten in der Schlange, kein Telefonieren. Für Wattenscheid bieten wir zuverlässige Lieferzeiten, damit dein Essen heiß bei dir ankommt. Probiere den Smile Döner und verstehe, warum wir zu den beliebtesten Lieferadressen in der Region zählen."
      distanceText="Nur 8 Minuten von Wattenscheid"
      keyword="Döner Wattenscheid"
    />
  );
}
