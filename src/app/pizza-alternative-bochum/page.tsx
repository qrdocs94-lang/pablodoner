import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Pizza Alternative Bochum | Smile Döner – Besser als Pizza",
  description:
    "Auf der Suche nach einer Pizza-Alternative in Bochum? Smile Döner bietet frischen Döner, Dürüm und Lahmacun – die bessere Wahl für deinen Lieferhunger.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Die beste Pizza-Alternative in Bochum"
      bodyText="Pizza ist lecker - aber manchmal hat man Lust auf etwas anderes. Smile Döner Bochum ist die perfekte Alternative, wenn du Abwechslung suchst, aber auf Qualität und Frische nicht verzichten willst. Während Pizza oft kalt geliefert wird oder im Karton aufweicht, kommt unser Döner frisch und heiß bei dir an. Das Fleisch wurde frisch am Spieß gegart, das Brot ist weich und aromatisch, die Saucen sind hausgemacht. Lahmacun als sogenannte türkische Pizza verbindet beide Welten: dünner Teig, würziger Belag, frisch gebacken - aber mit dem unverkennbaren Flair türkischer Küche. Dürüm, Hähnchendöner und Falafel ergänzen das Angebot und bieten für jeden etwas. Für Familien oder Gruppen lässt sich die Bestellung bei Smile Döner beliebig kombinieren - verschiedene Gerichte in einer Bestellung, alle frisch und gleichzeitig geliefert. Online bestellen in Bochum ist einfach und bequem. Probiere Smile Döner als deine neue Lieblingsalternative zur Pizza."
      distanceText="Lieferung in ganz Bochum"
      keyword="Pizza Alternative Bochum"
    />
  );
}
