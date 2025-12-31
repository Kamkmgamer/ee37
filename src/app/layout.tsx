import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";

import { ToastProvider } from "./_components/ui/Toast";
import { TRPCReactProvider } from "~/trpc/react";
import { ChatWidgetWrapper } from "./_components/ChatWidgetWrapper";
import { MediaViewer } from "./_components/feed/MediaViewer";
import { verifySession } from "~/lib/session";

export const viewport: Viewport = {
  themeColor: "#D4A853",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "الدفعة ٣٧ | جامعة السودان للعلوم والتكنولوجيا",
  description: "هندسة كهربائية - الدفعة السابعة والثلاثون",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EE37",
  },
  openGraph: {
    images: [
      "https://cp02bmy0uy.ufs.sh/f/0au6VoLZCTzGdHg7zpcjmLa2sVwTxnlRKGEXucqoZFhv9g31",
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySession();
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <TRPCReactProvider>
          <ToastProvider>
            {children}
            {session && <ChatWidgetWrapper userId={session.userId} />}
            <MediaViewer />
          </ToastProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
