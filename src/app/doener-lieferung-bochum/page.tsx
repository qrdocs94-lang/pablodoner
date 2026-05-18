import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Lieferung Bochum | Smile Döner – Schnell & Frisch",
  description:
    "Döner Lieferung in Bochum – Smile Döner liefert frischen Döner vom Spieß in alle Bochumer Stadtteile. Schnell, heiß und direkt zu dir nach Hause.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Lieferung Bochum – Frisch vom Spieß"
      bodyText="Smile Döner Bochum ist dein zuverlässiger Partner für Döner-Lieferung in die gesamte Stadt. Egal ob du in Bochum-Mitte, Wattenscheid, Querenburg oder einem anderen Stadtteil wohnst – wir bringen dir frisch zubereiteten Döner direkt an deine Adresse. Unser Lieferservice steht für Qualität ohne Abstriche: Das Fleisch kommt täglich frisch auf den Spieß, wird langsam gegart und erst bei Bestellungseingang abgeschnitten. So garantieren wir maximale Frische und Geschmack bis zur letzten Gabel. Die Lieferung erfolgt in beheizten Transportbehältern, damit dein Essen heiß bei dir ankommt. Unser Menü umfasst Döner im Brot, Dürüm-Wrap, Hähnchendöner, Lahmacun, Falafel und viele weitere Gerichte. Getränke, Saucen und Beilagen kannst du bequem dazu bestellen. Über unsere Online-Plattform geht die Bestellung schnell: Gerichte wählen, Extras konfigurieren, zahlen – fertig. Smile Döner liefert pünktlich und zuverlässig in ganz Bochum."
      distanceText="Lieferung in ganz Bochum"
      keyword="Döner Lieferung Bochum"
    />
  );
}
