/**
 * sitemap.js — Auto-generated dynamic sitemap for Goroly Shop
 * Next.js App Router native sitemap generation.
 * Accessible at: /sitemap.xml
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorolyshop.com';

export default async function sitemap() {
  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/admin`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic: Products
  let productPages = [];
  try {
    const res = await fetch(`${API_URL}/products?all=true`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data.products) ? data.products : [];
      productPages = products.map((p) => ({
        url: `${SITE_URL}/product/${p._id || p.id}`,
        lastModified: p.updated_at || p.created_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('[sitemap] Failed to fetch products:', e.message);
  }

  // Dynamic: Categories
  let categoryPages = [];
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 86400 } });
    if (res.ok) {
      const cats = await res.json();
      const catArr = Array.isArray(cats) ? cats : cats.categories || [];
      categoryPages = catArr.map((c) => ({
        url: `${SITE_URL}/?category=${encodeURIComponent(c.name)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error('[sitemap] Failed to fetch categories:', e.message);
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
