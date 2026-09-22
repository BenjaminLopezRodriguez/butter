import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Butter — product review for software teams",
  description:
    "Record yourself using a build and talk through it. Butter files timestamped findings your team can accept, discuss, or dismiss.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const sans = Geist({ subsets: ["latin"], variable: "--font-sans-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-geist" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-display",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="bg-ink text-fg antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
