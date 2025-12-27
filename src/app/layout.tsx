import "~/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ChatWidget } from "./_components/ChatWidget";
import { verifySession } from "~/lib/session";

export const metadata: Metadata = {
  title: "الدفعة ٣٧ | جامعة السودان للعلوم والتكنولوجيا",
  description: "هندسة كهربائية - الدفعة السابعة والثلاثون",
  openGraph: {
    images: [
      "https://cp02bmy0uy.ufs.sh/f/0au6VoLZCTzGdHg7zpcjmLa2sVwTxnlRKGEXucqoZFhv9g31",
    ],
  },
};

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-kufi",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySession();
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoKufi.variable} ${ibmPlexArabic.variable}`}
    >
      <body className="font-sans antialiased">
        <TRPCReactProvider>
          {children}
          {session && <ChatWidget />}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
