export const dynamic = 'force-dynamic';
import './globals.css'

export const metadata = {
  title: 'Pablo Döner Bochum — Bestellen',
  description: 'Frische Döner, Dürüm, Lahmacun & mehr. Jetzt bestellen!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[#FFF8F0]">{children}</body>
    </html>
  )
}

