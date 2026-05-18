import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Mitte | Smile Döner – Frisch & Lecker",
  description:
    "Döner in Bochum-Mitte bestellen – Smile Döner bietet frischen Döner vom Spieß, schnelle Lieferung und einfache Online-Bestellung. Nur 3 Minuten entfernt.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Mitte | Smile Döner"
      bodyText="Wer in Bochum-Mitte nach einem frischen, saftigen Döner sucht, ist bei Smile Döner genau richtig. Unser Restaurant liegt nur wenige Minuten vom Stadtzentrum entfernt und bietet dir authentische türkische Küche in ihrer besten Form. Täglich frisch zubereitetes Fleisch vom Spieß, knackiges Gemüse und hausgemachte Saucen machen jeden Döner zu einem Geschmackserlebnis. Du kannst bequem online bestellen und zwischen Abholung und Lieferung direkt nach Bochum-Mitte wählen. Unser Menü umfasst klassischen Döner im Brot, Dürüm-Wraps, Lahmacun und vegetarische Optionen wie Falafel. Wir legen großen Wert auf Frische – kein aufgewärmtes Essen, sondern jeden Tag neu zubereitete Zutaten. Über unsere Bestellplattform siehst du das gesamte Menü, wählst deine Lieblingszutaten und bezahlst sicher online. Schnelle Lieferzeiten und freundlicher Service machen Smile Döner zur ersten Wahl für alle Döner-Liebhaber in Bochum-Mitte."
      distanceText="Nur 3 Minuten von Bochum-Mitte"
      keyword="Döner Bochum-Mitte"
    />
  );
}
