import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Wiemelhausen | Smile Döner – Frischer Genuss",
  description:
    "Döner in Wiemelhausen bestellen – Smile Döner Bochum liefert frischen türkischen Döner in deinen Stadtteil. Online bestellen, schnell geliefert.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Wiemelhausen | Smile Döner"
      bodyText="Wiemelhausen ist ein lebendiger Bochumer Stadtteil – und Smile Döner ist seine neue Lieblingsküche. Wir liefern frisch zubereitete Döner, Dürüm, Lahmacun und mehr direkt nach Wiemelhausen. Unsere Küche arbeitet nach dem Prinzip: Qualität zuerst. Das Fleisch stammt aus sorgfältiger Auswahl und wird täglich frisch verarbeitet. Die Gewürzmischungen für unsere Marinaden folgen traditionellen türkischen Rezepten – kräftig im Geschmack, ausgewogen in der Würze. Dazu kommen frische Blattsalate, Tomaten, Gurken, Paprika und Zwiebeln – alles täglich angeliefert und sorgfältig vorbereitet. Unsere Saucen, von mild-cremig bis würzig-scharf, runden den Döner ab. In Wiemelhausen kannst du einfach online bestellen: Unsere Webseite ist mobilfreundlich, schnell und ohne Registrierung nutzbar. Die Lieferzeit ist kurz, das Essen heiß. Smile Döner bringt Wiemelhausen den Geschmack, den es verdient."
      distanceText="Nur 6 Minuten von Wiemelhausen"
      keyword="Döner Wiemelhausen"
    />
  );
}
