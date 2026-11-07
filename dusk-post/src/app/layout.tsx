import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

const themeScript = `
try {
  var stored = localStorage.getItem("night-press-theme");
  var night = stored === "night" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = night ? "night" : "day";
  document.documentElement.dataset.muted = localStorage.getItem("night-press-muted") === "1" ? "muted" : "on";
} catch (e) {}
`;

export const metadata: Metadata = {
  title: "Night Press — Sable",
  description:
    "Sable, a baby ink roller, keeps the Night Press in register. Align four color plates, pull a pocket edition, and hang one true line on the drying rack.",
  keywords: ["Night Press", "Sable", "letterpress", "printing", "portfolio", "creative coding", "interactive"],
  authors: [{ name: "Sable" }],
  openGraph: {
    title: "Night Press — Sable",
    description:
      "Sable, a baby ink roller, keeps the Night Press in register. Align the plates, pull a proof, and hang one true line.",
    siteName: "Night Press",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Night Press — Sable",
    description: "Sable, a baby ink roller, keeps the Night Press in register.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} ${fraunces.variable} ${plex.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a className="skip" href="#content">
          Skip to the press
        </a>
        {children}
      </body>
    </html>
  );
}
