'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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
  }, [pathname]); // Re-fetch occasionally

  // Facebook Pixel
  useEffect(() => {
    if (!tracking.pixelId) return;

    // Check if script already exists to prevent duplicates
    if (document.getElementById('fb-pixel')) return;

    const fbpixel = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${tracking.pixelId}');
fbq('track', 'PageView');`;

    const script = document.createElement('script');
    script.text = fbpixel;
    script.id = 'fb-pixel';
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${tracking.pixelId}&ev=PageView&noscript=1"/>`;
    noscript.id = 'fb-pixel-noscript';
    document.body.appendChild(noscript);

    return () => {
      const s = document.getElementById('fb-pixel');
      const n = document.getElementById('fb-pixel-noscript');
      if (s) s.remove();
      if (n) n.remove();
      // Also cleanup global fbq if we want, but usually left alone
    };
  }, [tracking.pixelId]);

  // GA4
  useEffect(() => {
    if (!tracking.ga4Id) return;
    if (document.getElementById('ga4-src')) return;

    const gtag = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${tracking.ga4Id}');`;
    
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}`;
    script1.async = true;
    script1.id = 'ga4-src';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.text = gtag;
    script2.id = 'ga4-init';
    document.head.appendChild(script2);

    return () => {
      const s1 = document.getElementById('ga4-src');
      const s2 = document.getElementById('ga4-init');
      if (s1) s1.remove();
      if (s2) s2.remove();
    };
  }, [tracking.ga4Id]);

  // Custom Code
  useEffect(() => {
    if (!tracking.customCode) return;
    const id = 'custom-header-code';
    const old = document.getElementById(id);
    if (old) old.remove();
    
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.style.display = 'none';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(tracking.customCode, 'text/html');
    
    doc.querySelectorAll('script').forEach((s) => {
      const ns = document.createElement('script');
      Array.from(s.attributes).forEach((a) => ns.setAttribute(a.name, a.value));
      ns.text = s.textContent;
      wrapper.appendChild(ns);
    });
    
    document.head.appendChild(wrapper);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [tracking.customCode]);

  return null;
}
