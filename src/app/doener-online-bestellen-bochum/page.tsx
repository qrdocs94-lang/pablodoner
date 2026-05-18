import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner online bestellen Bochum | Smile Döner",
  description:
    "Döner online bestellen in Bochum – bei Smile Döner einfach, schnell und direkt. Frischer Döner vom Spieß, sichere Zahlung, pünktliche Lieferung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner online bestellen in Bochum"
      bodyText="Döner online bestellen war in Bochum noch nie so einfach wie mit Smile Döner. Unser modernes Bestellsystem ermöglicht dir, in wenigen Klicks deinen Lieblingsdöner zu konfigurieren und direkt nach Hause zu bestellen. Kein Telefonieren, kein Warten in der Schlange – einfach online gehen, auswählen und fertig. Auf unserer Bestellseite findest du das vollständige Menü mit allen Preisen und Zutaten. Du kannst jeden Döner nach deinen Vorstellungen zusammenstellen: Brotsorte, Fleischart, Gemüsebeilagen und Saucen sind individuell konfigurierbar. Bezahlt wird sicher online per Karte – kein Bargeld nötig. Nach dem Absenden deiner Bestellung beginnen wir sofort mit der Zubereitung. Alles wird frisch gemacht: Das Fleisch kommt vom rotierenden Spieß, das Brot ist frisch gebacken, und die Saucen sind hausgemacht. Die Lieferung nach Bochum erfolgt zügig und zuverlässig. Smile Döner – Bochums einfachster Weg zu einem perfekten Döner."
      distanceText="Lieferung in ganz Bochum"
      keyword="Döner online bestellen Bochum"
    />
  );
}
