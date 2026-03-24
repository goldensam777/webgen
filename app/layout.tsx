import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://webgen.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:  "Webgen — Créez votre site web en quelques secondes avec l'IA",
    template: "%s | Webgen",
  },
  description:
    "Générateur de sites web propulsé par l'IA. Décrivez votre projet en quelques mots, " +
    "obtenez un site complet avec contenu, mise en page et couleurs. Éditez visuellement et publiez en un clic.",
  keywords: [
    "générateur site web", "créer site web IA", "site web automatique",
    "webgen", "générateur de sites web gratuit", "IA site web",
    "créer un site sans coder", "website builder IA",
  ],
  authors:  [{ name: "Webgen", url: BASE_URL }],
  creator:  "Webgen",
  publisher: "Webgen",

  openGraph: {
    type:        "website",
    locale:      "fr_FR",
    url:         BASE_URL,
    siteName:    "Webgen",
    title:       "Webgen — Créez votre site web en secondes avec l'IA",
    description: "Générateur de sites web IA. Décrivez votre projet, personnalisez, publiez.",
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Webgen — Créez votre site web en secondes",
    description: "Générateur de sites web propulsé par l'IA. Sans coder, en quelques secondes.",
    creator:     "@webgen_app",
    site:        "@webgen_app",
  },

  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  alternates: { canonical: BASE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
