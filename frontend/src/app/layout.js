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
  title: "Shopio - Modern Responsive eCommerce Platform",
  description: "Experience modern shopping with secure checkout, automated couriers, and instant orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900">
        <ShopProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ShopProvider>
        <TrackingScripts />
      </body>
    </html>
  );
}
