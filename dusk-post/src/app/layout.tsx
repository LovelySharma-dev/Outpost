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
  var mode = localStorage.getItem("grantly-mode");
  if (mode !== "morning" && mode !== "afternoon" && mode !== "night") mode = "night";
  document.documentElement.dataset.mode = mode;
  document.documentElement.dataset.muted = localStorage.getItem("grantly-muted") === "1" ? "muted" : "on";
} catch (e) {
  document.documentElement.dataset.mode = "night";
}
`;

export const metadata: Metadata = {
  title: "Grantly",
  description:
    "Grantly ranks scholarships, tracks applications, and keeps notes in this browser. Morning, afternoon, and night atmospheres stay on the device.",
  keywords: ["Grantly", "scholarships", "financial aid", "students", "deadlines"],
  openGraph: {
    title: "Grantly",
    description: "Rank scholarships and keep the application board in this browser.",
    siteName: "Grantly",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Grantly",
    description: "Rank scholarships and keep the application board in this browser.",
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
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
