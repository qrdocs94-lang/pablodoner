import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Dahlhausen | Smile Döner – Lieferung bis Dahlhausen",
  description:
    "Döner in Dahlhausen bestellen – Smile Döner Bochum liefert frischen Döner bis nach Dahlhausen. Online bestellen, frische Zutaten, pünktliche Lieferung.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Dahlhausen | Smile Döner"
      bodyText="Auch in Dahlhausen muss niemand auf einen guten Döner verzichten. Smile Döner Bochum liefert bis in diesen südlichen Stadtteil und bringt authentischen Döner-Genuss direkt zu deiner Tür. Die etwas längere Fahrtstrecke lohnt sich: Denn was bei uns in der Küche entsteht, ist kein gewöhnliches Schnellgericht, sondern frisch zubereitetes türkisches Essen mit Anspruch. Das Fleisch kommt täglich frisch auf den Spieß, das Fladenbrot ist weich und aromatisch, und die Füllungen werden sorgfältig abgestimmt. Dürüm, Lahmacun, Hähnchendöner und Falafel ergänzen das Angebot für jeden Geschmack. Für Dahlhausen empfehlen wir, die Bestellung rechtzeitig aufzugeben, damit das Essen auf dem direkten Weg zu dir kommt. Online bestellen ist einfach und schnell – öffne die Seite, wähle deine Favoriten und schließe die Bestellung ab. Smile Döner macht auch Dahlhausen zu einem Stück Bochumer Döner-Kultur."
      distanceText="Nur 12 Minuten von Dahlhausen"
      keyword="Döner Dahlhausen"
    />
  );
}
