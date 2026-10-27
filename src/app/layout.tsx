import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Slotly — Service Booking Made Simple",
    template: "%s | Slotly",
  },
  description: "Book professional services with ease. Slotly provides a seamless booking experience for clients and powerful management tools for service providers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
