import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import { LanguageProvider } from "@/context/LanguageContext";
import TrackingScripts from "@/components/TrackingScripts";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Goroly Shop - Modern Responsive eCommerce Platform",
  description: "Experience modern shopping with secure checkout, automated couriers, and instant orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <ShopProvider>
          <LanguageProvider>
            <main className="flex-1">{children}</main>
            <footer className="bg-white/95 backdrop-blur-lg border-t border-slate-200 py-4 text-center text-sm text-slate-600 dark:bg-gray-900/95 dark:border-gray-800">
              © {new Date().getFullYear()} Goroly Shop. All rights reserved.
            </footer>
          </LanguageProvider>
        </ShopProvider>
        <TrackingScripts />
      </body>
    </html>
  );
}
