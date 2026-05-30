import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapSignal — Global Prediction Market Heatmap",
  description: "Interactive world map showing real-time prediction market probabilities from Polymarket, Kalshi, and Opinion. Track global events, elections, economics, and geopolitics.",
  keywords: "mapsignal, prediction market, polymarket, kalshi, opinion, heatmap, probability, global events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
