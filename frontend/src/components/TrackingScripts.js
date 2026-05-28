'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TrackingScripts() {
  const [pixelId, setPixelId] = useState('');
  const [ga4Id, setGa4Id] = useState('');
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/public`);
        if (res.ok) {
          const data = await res.json();
          setPixelId(data.facebookPixelId || '');
          setGa4Id(data.ga4MeasurementId || '');
          setCustomCode(data.customHeaderCode || '');
        }
      } catch {
        // silently fail
      }
    };
    fetchTracking();
  }, []);

  useEffect(() => {
    if (!pixelId) return;
    const fbpixel = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
    const script = document.createElement('script');
    script.innerHTML = fbpixel;
    script.id = 'fb-pixel';
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    noscript.id = 'fb-pixel-noscript';
    document.body.appendChild(noscript);

    return () => {
      const s = document.getElementById('fb-pixel');
      const n = document.getElementById('fb-pixel-noscript');
      if (s) s.remove();
      if (n) n.remove();
    };
  }, [pixelId]);

  useEffect(() => {
    if (!ga4Id) return;
    const gtag = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ga4Id}');`;
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    script1.async = true;
    script1.id = 'ga4-src';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = gtag;
    script2.id = 'ga4-init';
    document.head.appendChild(script2);

    return () => {
      const s1 = document.getElementById('ga4-src');
      const s2 = document.getElementById('ga4-init');
      if (s1) s1.remove();
      if (s2) s2.remove();
    };
  }, [ga4Id]);

  useEffect(() => {
    if (!customCode) return;
    const id = 'custom-header-code';
    const old = document.getElementById(id);
    if (old) old.remove();
    const scripts = [];
    const html = customCode.replace(/<script[\s>]/gi, (m) => { scripts.push(m); return '<!--script-->'; }).replace(/<\/script>/gi, () => { scripts.push('</script>'); return '<!--/script-->'; });
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.style.display = 'none';
    wrapper.innerHTML = html;
    document.head.appendChild(wrapper);
    const scriptTags = wrapper.querySelectorAll('script');
    scriptTags.forEach((s) => {
      const ns = document.createElement('script');
      ns.setAttribute('data-custom-header', '1');
      Array.from(s.attributes).forEach((a) => ns.setAttribute(a.name, a.value));
      ns.textContent = s.textContent;
      s.replaceWith(ns);
    });
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [customCode]);

  return null;
}
