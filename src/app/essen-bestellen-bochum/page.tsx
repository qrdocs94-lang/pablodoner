import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Essen bestellen Bochum | Smile Döner – Online Bestellung",
  description:
    "Essen bestellen in Bochum – bei Smile Döner online türkisches Essen bestellen. Döner, Dürüm, Lahmacun und mehr. Schnell, frisch, direkt zu dir.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Essen bestellen in Bochum – Smile Döner"
      bodyText="Du möchtest in Bochum Essen bestellen, das wirklich frisch und lecker ist? Dann bist du bei Smile Döner genau richtig. Wir bieten dir türkische Küche auf höchstem Niveau – direkt online bestellbar und schnell geliefert. Unser Menü ist vielfältig: Vom klassischen Döner über Dürüm-Wrap und Lahmacun bis hin zu Falafel für Vegetarier und Veganer. Hähnchendöner, Döner-Teller, Snacks und frische Getränke ergänzen das Angebot. Jedes Gericht wird auf Bestellung frisch zubereitet – keine Convenienceware, keine aufgewärmten Reste. Beim Online-Bestellen in Bochum läuft alles über unsere übersichtliche Seite: Du siehst das gesamte Menü, kannst Zutaten nach Wunsch anpassen und sicher per Karte bezahlen. Nach der Bestellung geht es schnell: Unser Team bereitet dein Essen frisch zu und unser Fahrer bringt es direkt zu dir. Ob Mittagessen, Abendessen oder spontaner Hunger – Smile Döner ist Bochums erste Adresse, wenn es darum geht, gut und schnell zu essen."
      distanceText="Lieferung in ganz Bochum"
      keyword="Essen bestellen Bochum"
    />
  );
}
