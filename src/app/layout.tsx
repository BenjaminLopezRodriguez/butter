import "~/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  title: "Butter — product review for software teams",
  description:
    "Record yourself using a build and talk through it. Butter files timestamped findings your team can accept, discuss, or dismiss.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-plex",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(mono.variable, "font-sans", geist.variable)}>
      <body className="bg-ink text-fg antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
