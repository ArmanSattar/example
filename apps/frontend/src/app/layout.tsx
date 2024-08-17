import "./global.css";
import React from "react";
import { NavBar } from "./components/navbar/NavBar";
import { Providers } from "./providers";
import { MainSection } from "./components/MainSection";
import { BottomNavbar } from "./components/bottom-nav/BottomNavbar";
import { Inter } from "next/font/google";
import { LoadingWrapper } from "./components/LoadingWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "SolSpin",
  description: "Solana's number one lootbox platform. Open NFT and CSGO cases here! Win big!",
  keywords: ["Solana", "NFT", "CSGO", "lootbox", "cryptocurrency", "gaming"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.solspin.bet",
    siteName: "SolSpin",
    title: "SolSpin - Solana's #1 Lootbox Platform",
    description: "Solana's number one lootbox platform. Open NFT and CSGO cases here! Win big!",
    images: [
      {
        url: "https://www.solspin.bet/icons/logo.png",
        width: 1200,
        height: 630,
        alt: "SolSpin Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SolSpin2", // Replace with your actual Twitter handle
    title: "SolSpin - Solana's #1 Lootbox Platform",
    description: "Open NFT and CSGO cases on Solana's premier lootbox platform. Win big today!",
    images: ["https://www.solspin.bet/icons/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`w-full h-full overflow-x-hidden overscroll-none ${inter.variable}`}>
      <body className="flex flex-col w-full h-full overflow-x-hidden bg-background">
        <SpeedInsights />
        <Providers>
          <LoadingWrapper>
            <NavBar />
            <MainSection>{children}</MainSection>
            <BottomNavbar />
          </LoadingWrapper>
        </Providers>
      </body>
    </html>
  );
}
