import { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Döner Bochum-Hamme | Smile Döner – Schnell & Lecker",
  description:
    "Döner in Hamme bestellen – Smile Döner Bochum liefert frischen Döner nach Hamme. Online bestellen, schnell geliefert, täglich frisch vom Spieß.",
};

export default function Page() {
  return (
    <SeoLandingPage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Döner Bochum-Hamme | Smile Döner"
      bodyText="Hamme und Döner – eine Kombination, die mit Smile Döner Bochum perfekt funktioniert. Unser Lieferservice bringt dir in kürzester Zeit frisch zubereiteten Döner direkt in den Stadtteil Hamme. Was uns auszeichnet: Wir verwenden ausschließlich frische Zutaten, die täglich neu angeliefert werden. Das Fleisch dreht sich langsam am Spieß und wird erst beim Zubereiten deiner Bestellung abgeschnitten – so schmeckt Döner, wie er sein soll. Unser Menü bietet Klassiker wie den Döner im Brot oder als Teller, dazu Dürüm-Wraps mit verschiedenen Füllungen und Lahmacun als leichte Alternative. Vegetarier kommen mit unserem Falafel-Döner ebenfalls voll auf ihre Kosten. Die Bestellung geht online schnell von der Hand: Wähle aus dem Menü, füge alles in den Warenkorb und schließe den Kauf ab. Wir liefern heiß und pünktlich nach Hamme. Keine Kompromisse beim Geschmack – das ist das Versprechen von Smile Döner."
      distanceText="Nur 6 Minuten von Hamme"
      keyword="Döner Hamme"
    />
  );
}
