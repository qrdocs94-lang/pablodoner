import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Eppendorf | Smile Döner – Frisch & Schnell",
  description:
    "Döner in Eppendorf bestellen – Smile Döner Bochum liefert frischen Döner nach Eppendorf. Türkische Küche, schnelle Lieferung, Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Eppendorf | Smile Döner"
      bodyText="Eppendorf und Smile Döner – eine frische Partnerschaft für deinen Hunger. Unser Lieferservice in Bochum bringt dir täglich frisch zubereiteten Döner direkt nach Eppendorf. Was uns von der Konkurrenz unterscheidet: Wir kochen wie zuhause – mit Liebe, frischen Zutaten und dem Wissen, dass jeder Bissen zählt. Das Fleisch für unseren Döner wird sorgfältig gewürzt, schichtweise aufgesteckt und stundenlang am Spieß gegart. Erst wenn du bestellst, wird es frisch abgeschnitten und verarbeitet. Das Brot greifen wir täglich frisch an – weiches Fladenbrot oder knuspriger Lavash für den Dürüm. Gemüse, Saucen und Extras werden nach deinen Wünschen zusammengestellt. In Eppendorf kannst du direkt online bestellen: einfach, schnell, ohne Wartezeit am Telefon. Dein Liebling aus unserem Menü kommt frisch und heiß bei dir an. Smile Döner – Bochums bester Lieferservice auch für Eppendorf."
      distanceText="Nur 9 Minuten von Eppendorf"
      keyword="Döner Eppendorf"
    />
  );
}
