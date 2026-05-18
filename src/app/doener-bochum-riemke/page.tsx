import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Riemke | Smile Döner – Dein Döner-Lieferant",
  description:
    "Döner in Riemke bestellen – Smile Döner Bochum liefert frischen Döner nach Riemke. Schnelle Lieferung, frische Zutaten, Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Riemke | Smile Döner"
      bodyText="Riemke liegt zentral in Bochum, und Smile Döner ist noch zentraler in Sachen Geschmack. Unser Restaurant an der Franziskusstraße ist nur wenige Minuten von Riemke entfernt und beliefert den Stadtteil täglich mit frisch zubereitetem Döner. Das Herzstück unseres Angebots ist der klassische Döner: saftiges Fleisch vom Spieß, in knuspriges Fladenbrot gehüllt und mit ausgewählten Zutaten verfeinert. Jede Portion wird individuell zusammengestellt – du entscheidest, was rein kommt. Von mild bis scharf, mit oder ohne Zwiebeln, mit Fetakäse oder ohne – bei uns ist alles möglich. Neben dem Döner empfehlen wir unseren Dürüm, der als handgerolltes Wrap-Erlebnis besonders beliebt ist. Wer es leichter mag, greift zum Lahmacun oder zum Falafel. Über unsere Online-Plattform bestellst du in Riemke schnell und unkompliziert. Die Lieferung ist prompt, der Service freundlich. Smile Döner – immer in deiner Nähe."
      distanceText="Nur 5 Minuten von Riemke"
      keyword="Döner Riemke"
    />
  );
}
