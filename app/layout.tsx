import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Priyoshop — Petty Cash Dashboard",
  description: "Petty Cash & Operations Reporting Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`} style={{ backgroundColor: "#F5F7FA" }}>
        <AppProvider>
          <Sidebar />
          <div
            className="flex flex-col min-h-screen transition-all duration-300"
            style={{ marginLeft: "240px" }}
            id="main-wrapper"
          >
            <TopBar />
            <main className="flex-1 pt-14 overflow-auto">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
