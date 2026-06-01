'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TrackingScripts() {
  const [tracking, setTracking] = useState({ pixelId: '', ga4Id: '', customCode: '' });
  const pathname = usePathname();

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/public`);
        if (res.ok) {
          const data = await res.json();
          setTracking({
            pixelId: data.facebookPixelId || '',
            ga4Id: data.ga4MeasurementId || '',
            customCode: data.customHeaderCode || '',
          });
        }
      } catch {
        // silently fail
      }
    };
    fetchTracking();
  }, [pathname]);

  return (
    <>
      {tracking.pixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${tracking.pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${tracking.pixelId}&ev=PageView&noscript=1`}
              alt="facebook pixel"
            />
          </noscript>
        </>
      )}

      {tracking.ga4Id && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}`}
          />
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${tracking.ga4Id}');
              `,
            }}
          />
        </>
      )}

      {tracking.customCode && (
        <div dangerouslySetInnerHTML={{ __html: tracking.customCode }} />
      )}
    </>
  );
}
