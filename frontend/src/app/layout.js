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

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorolyshop.com';
  let siteTitle = "Goroly Shop - Modern Responsive eCommerce Platform";
  let faviconUrl = "/favicon.ico";
  let description = "Experience modern shopping with secure checkout, automated couriers, and instant orders.";

  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.siteTitle) siteTitle = data.siteTitle;
        if (data.faviconUrl) {
          if (data.faviconUrl.startsWith('http')) {
            faviconUrl = data.faviconUrl;
          } else {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
            faviconUrl = `${baseUrl}${data.faviconUrl.startsWith('/') ? '' : '/'}${data.faviconUrl}`;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch dynamic metadata:', error);
  }

  return {
    title: siteTitle,
    description: description,
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteTitle,
      title: siteTitle,
      description: description,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gorolyshop',
      title: siteTitle,
      description: description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorolyshop.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Goroly Shop',
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Bengali'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Goroly Shop',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/?keyword={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} h-full antialiased`}>
      <head>
        {/* JSON-LD: Organization + WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <ShopProvider>
          <LanguageProvider>
            <main className="flex-1">{children}</main>
          </LanguageProvider>
        </ShopProvider>
        <TrackingScripts />
      </body>
    </html>
  );
}
