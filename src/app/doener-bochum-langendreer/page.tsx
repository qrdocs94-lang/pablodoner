import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Langendreer | Smile Döner – Authentisch & Frisch",
  description:
    "Döner in Langendreer bestellen – Smile Döner Bochum liefert dir frisches türkisches Essen. Online bestellen, schnell geliefert oder zum Abholen bereit.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Langendreer | Smile Döner"
      bodyText="Langendreer trifft auf authentischen Döner-Genuss – dank Smile Döner Bochum. Wir beliefern den Stadtteil Langendreer mit frisch zubereitetem Döner, Dürüm und weiteren türkischen Spezialitäten. Unser Fleisch wird täglich mariniert und langsam am Spieß gegart, bis es die perfekte Zartheit und den unverkennbaren Geschmack erreicht. Dazu gibt es frisches Brot, knackiges Gemüse und selbst gemachte Saucen – zusammen ergibt das den Döner, für den Bochum bekannt ist. Die Online-Bestellung ist denkbar einfach: Öffne unsere Seite, wähle deine Favoriten aus dem Menü und lege sie in den Warenkorb. Nach dem Bezahlen kümmern wir uns um den Rest. Wir liefern pünktlich nach Langendreer, damit nichts kalt wird. Für Selbstabholer ist das Restaurant an der Franziskusstraße stets vorbereitet – kurze Wartezeiten garantiert. Lass den Abend mit einem echten Smile Döner ausklingen."
      distanceText="Nur 10 Minuten von Langendreer"
      keyword="Döner Langendreer"
    />
  );
}
