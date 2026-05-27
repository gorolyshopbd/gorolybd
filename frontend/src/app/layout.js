import { Outfit } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import TrackingScripts from "@/components/TrackingScripts";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Shopio - Modern Responsive eCommerce Platform",
  description: "Experience modern shopping with secure checkout, automated couriers, and instant orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900">
        <ShopProvider>
          {children}
        </ShopProvider>
        <TrackingScripts />
      </body>
    </html>
  );
}
