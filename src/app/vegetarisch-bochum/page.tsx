import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Vegetarisch Essen Bochum | Smile Döner – Veg. Optionen",
  description:
    "Vegetarisch essen in Bochum – Smile Döner bietet Falafel, vegetarischen Döner und mehr. Frisch, lecker, ohne Fleisch. Online bestellen in Bochum.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Vegetarisch essen in Bochum"
      bodyText="Vegetarisch essen und dabei auf Geschmack bestehen – das geht bei Smile Döner in Bochum. Wir haben unser Menü so gestaltet, dass auch Vegetarier und Veganer voll auf ihre Kosten kommen. Unser Falafel ist das Herzstück des vegetarischen Angebots: frisch aus Kichererbsen zubereitet, knusprig gebraten und im Döner oder Dürüm serviert. Dazu gibt es alle klassischen Beilagen und Saucen – vollständig pflanzlich und voller Geschmack. Auch Lahmacun lässt sich in einer vegetarischen Variante genießen. Wir glauben, dass vegetarisches Essen genauso befriedigend und lecker sein kann wie Fleischgerichte – und unser Falafel beweist das täglich. In Bochum kannst du vegetarisches Essen bei Smile Döner ganz einfach online bestellen: Öffne das Menü, filtere nach deinen Vorlieben und stelle deine Bestellung zusammen. Lieferung erfolgt schnell und zuverlässig in alle Bochumer Stadtteile. Smile Döner – der Ort, an dem Vegetarier in Bochum keine Kompromisse eingehen müssen."
      distanceText="Lieferung in ganz Bochum"
      keyword="Vegetarisch Bochum"
    />
  );
}
