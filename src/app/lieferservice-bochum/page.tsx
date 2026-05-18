import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Lieferservice Bochum | Smile Döner – Schnelle Lieferung",
  description:
    "Lieferservice Bochum – Smile Döner liefert türkisches Essen schnell und frisch zu dir. Döner, Dürüm, Lahmacun und mehr direkt an die Haustür.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Lieferservice Bochum – Smile Döner"
      bodyText="Wenn du in Bochum einen Lieferservice suchst, der wirklich überzeugt, ist Smile Döner deine erste Wahl. Wir liefern nicht nur schnell, sondern vor allem frisch – und genau das macht den Unterschied. Während andere Lieferservices auf vorgefertigte Produkte setzen, bereiten wir jede Bestellung von Grund auf neu zu. Das Fleisch wird frisch vom Spieß geschnitten, das Brot kommt frisch aus dem Ofen, und die Saucen rühren wir selbst an. Unser Liefergebiet umfasst alle Bochumer Stadtteile – von Mitte bis Wattenscheid, von Querenburg bis Hordel. Egal wo du in Bochum wohnst: Smile Döner kommt zu dir. Das Menü bietet türkische Klassiker: Döner, Dürüm, Hähnchendöner, Lahmacun, Falafel und Snacks. Für Familien gibt es Kombi-Angebote, für Einzelesser schnelle Kleinstbestellungen. Online bestellen macht den Prozess noch angenehmer: klar strukturiert, schnell abgeschlossen, sicher bezahlt. Smile Döner – Bochums Lieferservice mit echtem Anspruch."
      distanceText="Lieferung in ganz Bochum"
      keyword="Lieferservice Bochum"
    />
  );
}
