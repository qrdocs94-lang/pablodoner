import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Harpen | Smile Döner – Online Bestellen",
  description:
    "Döner in Harpen bestellen – Smile Döner Bochum liefert frischen Döner nach Harpen. Frische Zutaten, schnelle Lieferung, einfache Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Harpen | Smile Döner"
      bodyText="Für alle Döner-Fans in Harpen gibt es eine klare Empfehlung: Smile Döner Bochum. Unser Lieferservice bringt dir türkische Küche in Bestqualität direkt nach Harpen. Schon beim Öffnen der Verpackung wirst du vom Duft frisch gegrillten Fleisches empfangen – ein Versprechen, das wir täglich einhalten. Neben dem Klassiker Döner im Fladenbrot findest du in unserem Menü Dürüm, Hähnchendöner, Falafel sowie herzhafte Snacks wie Lahmacun. Für den kleinen Hunger oder als Beilage sind Pommes und weitere Snacks erhältlich. Jede Bestellung wird frisch und mit Sorgfalt zubereitet, bevor sie auf den Weg nach Harpen geht. Online bestellen ist mit unserer Plattform besonders einfach: kein Telefonieren, keine Missverständnisse – du wählst selbst aus und siehst direkt, was in deinen Döner kommt. Pünktliche Lieferung und freundlicher Service sind bei Smile Döner selbstverständlich. Überzeuge dich selbst – Harpen begeistert sich für unsere Döner."
      distanceText="Nur 9 Minuten von Harpen"
      keyword="Döner Harpen"
    />
  );
}
