/**
 * aiSeoService.js
 * Auto-generates SEO content using OpenRouter AI (InsForge gateway)
 * - Image ALT text generation
 * - Internal linking in product descriptions
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'openai/gpt-4o-mini'; // fast & cheap

/**
 * Generic chat completion helper
 */
async function chatComplete(messages, maxTokens = 200) {
  if (!OPENROUTER_API_KEY) {
    console.warn('[aiSeoService] OPENROUTER_API_KEY not set — skipping AI generation.');
    return null;
  }
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Goroly Shop SEO',
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[aiSeoService] API error:', err);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[aiSeoService] Fetch error:', err.message);
    return null;
  }
}

/**
 * Generate SEO-optimized ALT text for a product image.
 * @param {Object} product - { name, category, brand, description }
 * @returns {string} ALT text string
 */
export async function generateImageAlt(product) {
  const { name = '', category = '', brand = '' } = product;
  const messages = [
    {
      role: 'system',
      content:
        'You are an SEO expert. Generate a concise, descriptive image ALT text (max 12 words) for an e-commerce product image. Include the product name, category, and brand if relevant. Return ONLY the alt text, no quotes, no extra text.',
    },
    {
      role: 'user',
      content: `Product: "${name}", Category: "${category}", Brand: "${brand}"`,
    },
  ];
  const result = await chatComplete(messages, 60);
  // Fallback: build a sensible alt from product fields
  return result || `${name}${brand ? ` by ${brand}` : ''}${category ? ` - ${category}` : ''}`.trim();
}

/**
 * Inject internal links into a product description.
 * Finds keywords matching existing product/category names and wraps them
 * in anchor tags pointing to the correct pages.
 *
 * @param {string} description - raw product description text/HTML
 * @param {Array}  categories  - [{ name, _id }] from DB
 * @param {Array}  products    - [{ name, _id }] from DB (top-N for efficiency)
 * @param {string} currentProductId - do NOT link to self
 * @returns {string} description with internal links injected
 */
export async function injectInternalLinks(description, categories = [], products = [], currentProductId = '') {
  if (!description || (!categories.length && !products.length)) return description;

  // Build a reference map for the AI
  const catLinks = categories.slice(0, 30).map((c) => ({ keyword: c.name, url: `/?category=${encodeURIComponent(c.name)}` }));
  const prodLinks = products
    .filter((p) => String(p._id) !== String(currentProductId))
    .slice(0, 30)
    .map((p) => ({ keyword: p.name, url: `/product/${p._id}` }));

  const linkMap = [...catLinks, ...prodLinks];

  if (!OPENROUTER_API_KEY) {
    // Fallback: simple string matching without AI
    return simpleInternalLink(description, linkMap);
  }

  const messages = [
    {
      role: 'system',
      content: `You are an SEO internal-linking assistant.
Given an e-commerce product description and a JSON list of {keyword, url} pairs, inject <a href="url">keyword</a> HTML anchor tags for the FIRST occurrence of each keyword in the description (case-insensitive). 
Rules:
- Only link keywords that naturally appear in the text.
- Link each keyword AT MOST ONCE.
- Do NOT modify any other HTML or text.
- Return the full modified description and NOTHING else.`,
    },
    {
      role: 'user',
      content: `DESCRIPTION:\n${description}\n\nLINK MAP:\n${JSON.stringify(linkMap)}`,
    },
  ];

  const result = await chatComplete(messages, 1200);
  return result || simpleInternalLink(description, linkMap);
}

/**
 * Fallback: inject first-match links without AI
 */
function simpleInternalLink(description, linkMap) {
  let result = description;
  for (const { keyword, url } of linkMap) {
    if (!keyword || !url) continue;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![">])\\b(${escaped})\\b(?![^<]*>)`, 'i');
    result = result.replace(regex, `<a href="${url}" title="${keyword}">$1</a>`);
  }
  return result;
}

/**
 * Generate full meta for a product (title + description) if missing.
 */
export async function generateProductMeta(product) {
  const { name = '', category = '', brand = '', description = '' } = product;
  const shortDesc = description.replace(/<[^>]+>/g, '').slice(0, 200);

  const messages = [
    {
      role: 'system',
      content:
        'You are an SEO copywriter. Generate a JSON object with "title" (max 60 chars) and "description" (max 155 chars) for an e-commerce product page. Return ONLY valid JSON.',
    },
    {
      role: 'user',
      content: `Product: "${name}", Category: "${category}", Brand: "${brand}", Info: "${shortDesc}"`,
    },
  ];

  const result = await chatComplete(messages, 300);
  if (!result) return { title: `${name} | Goroly Shop`, description: shortDesc.slice(0, 155) };

  try {
    const parsed = JSON.parse(result);
    return {
      title: parsed.title || `${name} | Goroly Shop`,
      description: parsed.description || shortDesc.slice(0, 155),
    };
  } catch {
    return { title: `${name} | Goroly Shop`, description: shortDesc.slice(0, 155) };
  }
}
