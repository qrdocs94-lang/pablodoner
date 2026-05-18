import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Falafel Bochum | Smile Döner – Vegetarisch & Vegan",
  description:
    "Falafel in Bochum bestellen – Smile Döner bietet knusprigen Falafel, vegetarisch und vegan. Frisch zubereitet, schnell geliefert, online bestellen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Falafel Bochum – Vegetarisch & Lecker"
      bodyText="Falafel bei Smile Döner Bochum ist mehr als nur eine vegetarische Option – es ist ein Genuss für sich. Unsere Falafel werden täglich frisch aus Kichererbsen, Kräutern und Gewürzen geformt und goldbraun frittiert. Das Ergebnis sind außen knusprige, innen weiche und aromatische Bällchen voller Geschmack. Serviert im frischen Fladenbrot mit Salat, Tomaten, Gurken, roter Zwiebel und Tahin-Sauce ergibt das einen vollständigen Falafel-Döner, der sowohl Vegetarier als auch Fleischesser begeistert. Unser Falafel ist außerdem vollständig vegan – keine tierischen Produkte in Teig oder Füllung. In Bochum ist Falafel von Smile Döner die beste Wahl für alle, die auf Fleisch verzichten, aber nicht auf Genuss. Online bestellen geht schnell: Falafel-Döner oder Falafel-Dürüm auswählen, Saucen und Extras hinzufügen, fertig. Wir liefern frisch und pünktlich in alle Bochumer Stadtteile. Probiere jetzt unseren Falafel – Bochums besten."
      distanceText="Lieferung in ganz Bochum"
      keyword="Falafel Bochum"
    />
  );
}
