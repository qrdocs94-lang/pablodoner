import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Hofstede | Smile Döner – Frisch & Günstig",
  description:
    "Döner in Hofstede bestellen – Smile Döner Bochum liefert dir frisches türkisches Essen nach Hofstede. Online bestellen, schnell geliefert.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Hofstede | Smile Döner"
      bodyText="Hofstede verdient einen Döner der Extraklasse – und genau das liefert Smile Döner Bochum. Unser Lieferservice hat es sich zur Aufgabe gemacht, frisch zubereitetes türkisches Essen in alle Teile Bochums zu bringen, natürlich auch nach Hofstede. Frisches Fleisch, täglich neu gebackenes Brot und knackige Gemüsezutaten bilden die Grundlage jedes unserer Döner. Dazu kommen hausgemachte Saucen, die nach traditionellen Rezepten zubereitet werden und dem Döner seine charakteristische Note geben. Im Menü findest du neben Döner auch Lahmacun, Dürüm und köstliche vegetarische Optionen. Unser Online-Bestellsystem ist so gestaltet, dass du in weniger als zwei Minuten deine Wunschzusammenstellung aufgegeben hast. Zahlung per Karte oder online – bequem und sicher. Die Lieferung nach Hofstede erfolgt zügig, damit das Essen frisch auf dem Tisch steht. Smile Döner: Bochums Antwort auf echten Döner-Hunger."
      distanceText="Nur 8 Minuten von Hofstede"
      keyword="Döner Hofstede"
    />
  );
}
