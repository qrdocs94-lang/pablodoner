import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Hähnchen Döner Bochum | Smile Döner – Knusprig & Saftig",
  description:
    "Hähnchen Döner in Bochum bestellen – Smile Döner Bochum macht saftigen Hähnchendöner vom Spieß. Frisch, knusprig, online bestellen und liefern lassen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Hähnchen Döner Bochum"
      bodyText="Der Hähnchendöner bei Smile Döner Bochum ist eine echte Empfehlung für alle, die es etwas leichter mögen. Zartes Hähnchenfleisch wird in einer aromatischen Marinade eingelegt und dann am Spieß langsam gegart, bis es außen goldbraun und innen saftig ist. Im Vergleich zum klassischen Rind- oder Kalbsdöner ist der Hähnchendöner kalorienärmer, aber geschmacklich genauso intensiv. Das frisch abgeschnittene Fleisch landet direkt in frischem Fladenbrot zusammen mit knackigem Salat, Tomaten, Gurken und deiner Lieblingssauce. Wer Dürüm bevorzugt, kann den Hähnchendöner auch als Wrap bestellen – handgerollt und perfekt für unterwegs. In Bochum bestellen Hähnchendöner-Fans bei Smile Döner einfach online: Menü aufrufen, Hähnchendöner auswählen, Extras anpassen und per Karte bezahlen. Die Lieferung erfolgt schnell in alle Bochumer Stadtteile. Smile Döner – weil Hähnchendöner in Bochum am besten von uns schmeckt."
      distanceText="Lieferung in ganz Bochum"
      keyword="Hähnchen Döner Bochum"
    />
  );
}
