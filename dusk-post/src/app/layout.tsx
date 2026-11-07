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
  document.documentElement.dataset.theme = "day";
  document.documentElement.dataset.muted = localStorage.getItem("grantly-muted") === "1" ? "muted" : "on";
} catch (e) {}
`;

export const metadata: Metadata = {
  title: "Grantly — Find the award. Keep the deadline.",
  description:
    "Grantly is a timetable for scholarships. Search by level, field, need, deadline, and award size, then keep applications in a wallet on this browser.",
  keywords: ["Grantly", "scholarships", "financial aid", "students", "deadlines"],
  openGraph: {
    title: "Grantly",
    description: "A route book for finding and tracking educational funding.",
    siteName: "Grantly",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Grantly",
    description: "A route book for finding and tracking educational funding.",
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
          Skip to the timetable
        </a>
        {children}
      </body>
    </html>
  );
}
