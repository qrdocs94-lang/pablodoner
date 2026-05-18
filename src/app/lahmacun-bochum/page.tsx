import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Lahmacun Bochum | Smile Döner – Türkische Pizza",
  description:
    "Lahmacun in Bochum bestellen – Smile Döner macht echten Lahmacun nach türkischer Art. Frisch gebacken, würzig belegt, schnell geliefert.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Lahmacun Bochum – Türkische Pizza"
      bodyText="Lahmacun ist weit mehr als nur türkische Pizza – es ist eine kulinarische Tradition, die Smile Döner mit Leidenschaft nach Bochum bringt. Unser Lahmacun wird auf hauchdünnem Teig gebacken, der außen knusprig und innen zart ist. Der Belag besteht aus feinem Hackfleisch, frischen Kräutern, Zwiebeln, Paprika und einer hausgemachten Würzpaste. Das Ergebnis ist ein aromatisches, leichtes Gericht, das allein oder als Vorspeise beim Döner-Besuch überzeugt. Traditionell wird Lahmacun mit frischer Petersilie, Tomaten und einem Spritzer Zitronensaft serviert und gerollt – so entsteht ein handliches, köstliches Wrap-Erlebnis. In Bochum kannst du Lahmacun bequem online bei Smile Döner bestellen und dir nach Hause liefern lassen. Kombiniere ihn mit einem frischen Ayran oder einem anderen Getränk aus unserem Sortiment. Lahmacun von Smile Döner ist frisch gebacken, nie aufgewärmt, und immer auf den Punkt gewürzt. Jetzt bestellen und den Geschmack der Türkei erleben."
      distanceText="Lieferung in ganz Bochum"
      keyword="Lahmacun Bochum"
    />
  );
}
