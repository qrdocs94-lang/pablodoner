import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Querenburg | Smile Döner – Perfekt für Studenten",
  description:
    "Döner in Querenburg bestellen – Smile Döner Bochum liefert frischen Döner in den Unistadtteil Querenburg. Günstig, frisch, schnell online bestellen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Querenburg | Smile Döner"
      bodyText="Querenburg, Heimat der Ruhr-Universität, verdient einen Döner, der mit dem Studienalltag Schritt hält – günstig, sättigend und trotzdem richtig lecker. Smile Döner Bochum liefert dir genau das. Ob zwischen zwei Vorlesungen, nach einem langen Lerntag oder am Wochenende: Unser Lieferservice bringt frischen Döner direkt nach Querenburg. Auf dem Spieß wartet täglich neu mariniertes Fleisch, das zart und aromatisch serviert wird. Das Brot ist frisch gebacken, das Gemüse knackig, die Saucen hausgemacht. Im Menü findest du alles von klassischem Döner über Dürüm bis hin zu vegetarischen Alternativen wie Falafel – perfekt für jeden Geschmack und jedes Budget. Bestelle jetzt über unsere Plattform: Einfach öffnen, auswählen und bestellen. Keine App nötig, kein Account erforderlich. Smile Döner liefert zuverlässig nach Querenburg und macht jede Pause zur Genusserfahrung."
      distanceText="Nur 11 Minuten von Querenburg"
      keyword="Döner Querenburg"
    />
  );
}
