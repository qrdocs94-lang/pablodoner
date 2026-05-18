import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Gerthe | Smile Döner – Frisch vom Spieß",
  description:
    "Döner in Gerthe bestellen – Smile Döner Bochum bringt frischen Döner vom Spieß nach Gerthe. Schnelle Lieferung, faire Preise, einfache Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Gerthe | Smile Döner"
      bodyText="Im Stadtteil Gerthe hat man jetzt eine neue Lieblingsadresse für Döner: Smile Döner Bochum. Wir liefern dir frisch zubereitetes türkisches Essen direkt nach Hause – zuverlässig und mit echtem Geschmack. Unser Döner wird aus hochwertigem Fleisch hergestellt, das täglich am Spieß gegart wird. Das Ergebnis ist ein saftiger, aromatischer Döner, der keine Vergleiche scheut. Neben Fleischdöner haben wir auch Hähnchendöner, Falafel für Vegetarier sowie Dürüm und Lahmacun im Angebot. Alle Beilagen – von Weißkohl bis Fetakäse – sind stets frisch und werden direkt am Tag der Bestellung vorbereitet. Über unsere übersichtliche Online-Plattform bestellen Gerthe-Bewohner ohne Aufwand: einfach auswählen, bezahlen und warten. Die Lieferung dauert nur wenige Minuten. Alternativ kannst du deine Bestellung auch zur Abholung aufgeben und direkt an der Franziskusstraße abholen. Smile Döner – der Döner, der Gerthe begeistert."
      distanceText="Nur 7 Minuten von Gerthe"
      keyword="Döner Gerthe"
    />
  );
}
