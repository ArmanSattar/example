"use client";

import "./global.css";
import React from "react";
import { NavBar } from "./components/navbar/NavBar";
import { Providers } from "./providers";
import { MainSection } from "./components/MainSection";
import { BottomNavbar } from "./components/bottom-nav/BottomNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="w-full h-full overflow-x-hidden overscroll-none">
      <body className="flex flex-col w-full h-full overflow-x-hidden bg-background">
        <Providers>
          <NavBar />
          <MainSection>{children}</MainSection>
          <BottomNavbar />
        </Providers>
      </body>
    </html>
  );
}
