import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Weitmar | Smile Döner – Täglich Frisch",
  description:
    "Döner in Weitmar bestellen – Smile Döner Bochum liefert frisches türkisches Essen nach Weitmar. Online bestellen, schnell & lecker.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Weitmar | Smile Döner"
      bodyText="Weitmar hat ein neues kulinarisches Highlight: den Smile Döner Lieferservice. Wir bringen dir die besten Döner Bochums direkt nach Hause – frisch, heiß und voller Geschmack. Unser Sortiment richtet sich an alle, die echte türkische Küche lieben: der Döner im Brot ist der Klassiker schlechthin, aber auch Dürüm, Lahmacun, Hähnchendöner und Falafel stehen auf der Karte. Wir arbeiten ausschließlich mit frischen Zutaten und verzichten auf Convenience-Produkte. Das Fleisch wird täglich mariniert und am Spieß gegart – nichts wird eingefroren und aufgewärmt. In Weitmar kommt das Essen so bei dir an, als würdest du direkt im Restaurant sitzen. Bestelle online in wenigen Schritten: Menü auswählen, Warenkorb befüllen, Zahlung abschließen. Wir kümmern uns um den Rest und liefern pünktlich zu dir. Egal ob Mittagspause, Feierabend oder spontaner Hunger – Smile Döner ist für Weitmar da."
      distanceText="Nur 7 Minuten von Weitmar"
      keyword="Döner Weitmar"
    />
  );
}
