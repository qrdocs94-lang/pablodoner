import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Steinkuhl | Smile Döner – Dein Liefer-Döner",
  description:
    "Döner in Steinkuhl bestellen – Smile Döner Bochum liefert frischen Döner nach Steinkuhl. Schnelle Lieferung, frische Zutaten, einfache Online-Bestellung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Steinkuhl | Smile Döner"
      bodyText="Steinkuhl bekommt mit Smile Döner Bochum einen Lieferservice, der hält, was er verspricht: frischen, echten Döner ohne Kompromisse. Wir glauben, dass Döner mehr ist als Fast Food – es ist Handwerk, Tradition und Leidenschaft in einem. Deshalb bereiten wir täglich frisch zu: das Fleisch langsam am Spieß, das Brot knusprig vom Grill, die Saucen nach Hausrezept. Für Steinkuhl bedeutet das: Du bestellst online, wir bereiten vor Ort zu und liefern direkt zu dir. Unser Menü bietet neben dem Döner im Fladenbrot auch Dürüm-Wraps, Hähnchendöner, Falafel und verschiedene Teller für den großen Hunger. Alle Bestellungen werden mit Sorgfalt zusammengestellt – keine vorgefertigten Portionen, jede Bestellung frisch. Über unsere Online-Bestellseite geht alles schnell: Gericht auswählen, Extras hinzufügen, bezahlen und warten. Smile Döner – der frische Unterschied in Steinkuhl."
      distanceText="Nur 8 Minuten von Steinkuhl"
      keyword="Döner Steinkuhl"
    />
  );
}
