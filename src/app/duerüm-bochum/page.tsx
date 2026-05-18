import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Dürüm Bochum | Smile Döner – Frischer Dürüm",
  description:
    "Dürüm in Bochum bestellen – Smile Döner macht frisch gerollten Dürüm mit Hähnchen oder Fleisch. Knusprig, saftig, online bestellen und liefern lassen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Dürüm Bochum – Frisch gerollt"
      bodyText="Der Dürüm von Smile Döner Bochum ist eine wahre Gaumenfreude – dünn ausgerollter Lavash-Teig, frisch gegrilltes Fleisch und knackige Zutaten, alles fest zusammengerollt und goldbraun auf dem Grill erwärmt. Im Gegensatz zum Döner im Brot ist der Dürüm kompakter, tragbarer und durch den dünneren Teig geschmacklich intensiver. Das Fleisch – ob Rind, Kalb oder Hähnchen – kommt direkt vom rotierenden Spieß und wird frisch in den Wrap gegeben. Dazu kommen Salate, Tomaten, Zwiebeln, Paprika und wahlweise Fetakäse sowie verschiedene Saucen nach Wahl. Jeder Dürüm bei Smile Döner wird von Hand gerollt und auf dem Grill kurz angepresst, damit alles perfekt zusammenhält. In Bochum kannst du den Dürüm online bestellen: Wähle Fleischsorte, Zutaten und Saucen ganz nach deinem Geschmack. Lieferung erfolgt schnell in alle Bochumer Stadtteile. Smile Döner – für den besten Dürüm in Bochum."
      distanceText="Lieferung in ganz Bochum"
      keyword="Dürüm Bochum"
    />
  );
}
