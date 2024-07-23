import "./global.css";
import React from "react";
import { NavBar } from "./components/navbar/NavBar";
import { Providers } from "./providers";
import { MainSection } from "./components/MainSection";
import { BottomNavbar } from "./components/bottom-nav/BottomNavbar";
import { Poppins } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "SolSpin",
  description: "Solana's number one lootbox platform. Open NFT and CSGO cases here! Win big!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`w-full h-full overflow-x-hidden overscroll-none ${poppins.variable}`}
    >
      <body className="flex flex-col w-full h-full overflow-x-hidden bg-background">
        <Providers>
          <NavBar />
          <MainSection>{children}</MainSection>
          <SpeedInsights />
          <BottomNavbar />
        </Providers>
      </body>
    </html>
  );
}
