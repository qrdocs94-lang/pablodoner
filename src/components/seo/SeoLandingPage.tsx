import Link from "next/link";

interface SeoLandingPageProps {
  title: string;
  description: string;
  h1: string;
  bodyText: string;
  distanceText: string;
  keyword: string;
}

const jsonLd = (description: string) => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Smile Döner Bochum",
  description,
  url: "https://smiledoener.de",
  telephone: "+492345798533",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Franziskusstr. 1",
    addressLocality: "Bochum",
    postalCode: "44795",
    addressCountry: "DE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "11:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "12:00",
      closes: "21:00",
    },
  ],
  servesCuisine: ["Turkish", "Döner", "Falafel"],
  priceRange: "€",
  hasMap: "https://maps.google.com/?q=Franziskusstr.+1,+44795+Bochum",
});

export default function SeoLandingPage({
  h1,
  bodyText,
  distanceText,
  description,
}: SeoLandingPageProps) {
  const structuredData = jsonLd(`${description} ${distanceText}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div
        style={{
          background: "#0a0a0a",
          minHeight: "100vh",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "rgba(0,0,0,0.8)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#F39C12",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: 1,
            }}
          >
            🌯 Smile Döner
          </Link>
          <Link
            href="/"
            style={{
              background: "#22c55e",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 14,
              padding: "10px 20px",
              borderRadius: 10,
              transition: "opacity 0.2s",
            }}
          >
            Jetzt bestellen →
          </Link>
        </header>

        {/* Main Content */}
        <main
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "56px 24px 80px",
          }}
        >
          {/* Distance badge */}
          <div
            style={{
              display: "inline-block",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#22c55e",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            📍 {distanceText}
          </div>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.15,
              margin: "0 0 24px",
              color: "#ffffff",
            }}
          >
            {h1}
          </h1>

          {/* Body text */}
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 48px",
            }}
          >
            {bodyText}
          </p>

          {/* Info block */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "28px 32px",
              marginBottom: 40,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: "0 0 20px",
                color: "#F39C12",
              }}
            >
              Restaurantinfo
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Adresse</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
                    Franziskusstr. 1, 44795 Bochum
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📞</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Telefon</div>
                  <a
                    href="tel:02345798533"
                    style={{
                      color: "#22c55e",
                      textDecoration: "none",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    0234 579 8533
                  </a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🕐</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Öffnungszeiten</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6 }}>
                    Mo–Sa: 11:00 – 22:00 Uhr
                    <br />
                    So / Feiertage: 12:00 – 21:00 Uhr
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#22c55e",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: 18,
              padding: "18px 40px",
              borderRadius: 14,
              letterSpacing: 0.5,
              boxShadow: "0 4px 24px rgba(34,197,94,0.35)",
            }}
          >
            Jetzt bestellen →
          </Link>
        </main>

        {/* Footer */}
        <footer
          style={{
            background: "rgba(0,0,0,0.6)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.4)",
            padding: "24px",
            textAlign: "center",
            fontSize: 13,
          }}
        >
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div
              style={{
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              🌯 Smile Döner Bochum
            </div>
            <div style={{ marginBottom: 8 }}>
              Franziskusstr. 1, 44795 Bochum
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              <a
                href="/impressum"
                style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              >
                Impressum
              </a>
              <a
                href="/datenschutz"
                style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              >
                Datenschutz
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
