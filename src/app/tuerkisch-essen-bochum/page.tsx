import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Türkisch Essen Bochum | Smile Döner – Authentisch & Frisch",
  description:
    "Türkisches Essen in Bochum bestellen – Smile Döner bietet authentische türkische Küche mit Döner, Lahmacun, Dürüm und Falafel. Online bestellen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Türkisches Essen in Bochum"
      bodyText="Türkische Küche steht für Vielfalt, Frische und intensive Aromen – und genau diese Qualitäten bringt Smile Döner nach Bochum. Unser Restaurant an der Franziskusstraße ist ein Ort, an dem Tradition und moderner Lieferservice zusammenkommen. Wir servieren authentisches türkisches Essen: Döner nach Familienrezept, würziger Lahmacun mit frischen Kräutern und Zitrone, zart gerollter Dürüm und knusprig gebratener Falafel. Jedes Gericht trägt die Handschrift echter türkischer Kochkunst. Die Würzmischungen stammen aus traditionellen Rezepten, die über Generationen weitergegeben wurden. Wir verwenden keine Fertigmischungen – alles wird frisch und von Hand vorbereitet. In Bochum kannst du türkisches Essen ganz einfach online bestellen: Unser Menü gibt dir einen vollständigen Überblick über alle Gerichte. Wähle deinen Favoriten, stelle ihn nach Wunsch zusammen und bestelle mit wenigen Klicks. Smile Döner liefert Bochum echtes türkisches Geschmackserlebnis."
      distanceText="Lieferung in ganz Bochum"
      keyword="Türkisch Essen Bochum"
    />
  );
}
