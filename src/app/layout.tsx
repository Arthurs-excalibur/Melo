import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/layout/PageTransition";
import { Providers } from "@/components/providers";
import { ThemeWrapper } from "@/components/layout/ThemeWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Melo",
  description: "Discover your emotional soundtrack through AI. Connect Spotify and see your music taste visualised.",
  icons: {
    icon: "/logo/enhanced.png",
    apple: "/logo/enhanced.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-mood-darkest text-foreground overflow-x-hidden selection:bg-mood-purple/30">
        <Providers>
          {/* Background is outside of PageTransition so 'fixed' is never broken by 'filter'/'transform' */}
          <div className="fixed top-0 left-0 w-full h-[110vh] z-[-1] pointer-events-none bg-mood-darkest" aria-hidden="true">
            <ThemeWrapper />
          </div>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
