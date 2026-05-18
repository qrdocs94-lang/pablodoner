import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum spät | Smile Döner – Bis 22 Uhr geöffnet",
  description:
    "Döner in Bochum bis 22 Uhr bestellen – Smile Döner hat montags bis samstags bis 22 Uhr geöffnet. Spätabends noch frischen Döner online bestellen.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner in Bochum bis 22 Uhr"
      bodyText="Der Hunger kommt oft dann, wenn man es am wenigsten erwartet – und manchmal ist es bereits spät abends. Smile Döner Bochum hat deshalb montags bis samstags bis 22 Uhr geöffnet und liefert dir auch am Abend noch frisch zubereiteten Döner. Kein aufgewärmtes Essen, kein abgestander Spieß – auch kurz vor Feierabend steht bei uns frisches Fleisch auf dem Spieß. Das Fladenbrot ist weich, das Gemüse knackig, die Saucen hausgemacht – genau wie zum Mittagessen. Ob nach der Arbeit, nach einem langen Abend mit Freunden oder einfach wenn der Hunger zum falschen Zeitpunkt kommt: Smile Döner ist für dich da. Sonntags und an Feiertagen haben wir von 12 bis 21 Uhr geöffnet – so bist du auch am freien Tag bestens versorgt. Online bestellen ist bis kurz vor Schließung möglich: Menü öffnen, auswählen, bezahlen und warten. Wir liefern noch bis in den späten Abend nach ganz Bochum. Smile Döner – für alle, die Döner ohne Zeitdruck genießen wollen."
      distanceText="Lieferung in ganz Bochum"
      keyword="Döner Bochum spät"
    />
  );
}
