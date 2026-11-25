import type { Metadata } from "next";
import "allo-font";
import "./globals.css";
import { CommunityProvider } from "@/context/community-context";

export const metadata: Metadata = {
  title: "Still Designers — New tools. Same curiosity.",
  description:
    "A playful online community for product, UI, and UX designers exploring how AI changes design work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-sun selection:text-ink-on-sun">
        <CommunityProvider>{children}</CommunityProvider>
      </body>
    </html>
  );
}
