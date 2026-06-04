/**
 * aiMarketingService.js
 * Analyzes media (image/video URLs or base64) to extract marketing insights.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'openai/gpt-4o-mini'; // Fast, cheap, and vision-capable

/**
 * Generic chat completion helper for Vision/Text
 */
async function chatComplete(messages, maxTokens = 500) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not set.');
  }
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Goroly Shop AI Marketing',
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[aiMarketingService] API error:', err);
      throw new Error(`OpenRouter API Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[aiMarketingService] Fetch error:', err.message);
    throw err;
  }
}

/**
 * Analyze Media for Marketing Insights
 * @param {string} mediaUrl - A URL (http/https) or Base64 Data URI of the image.
 * @param {string} type - 'image' or 'video'
 * @returns {Object} { content: string, ocrText: string, summary: string, audience: string }
 */
export async function analyzeMarketingMedia(mediaUrl, type = 'image') {
  let contentPayload;

  if (type === 'image') {
    contentPayload = [
      {
        type: 'text',
        text: `Analyze this image for marketing purposes. Please provide the output strictly as a JSON object with four keys:
1. "content": A comma-separated list of the main objects, faces, and products detected.
2. "ocrText": Any readable text in the image (if none, write "None").
3. "summary": A 1-2 sentence marketing-focused summary of what is happening in the image.
4. "audience": The inferred target audience demographic (e.g., "Young adults interested in tech").
Ensure the response is ONLY valid JSON.`,
      },
      {
        type: 'image_url',
        image_url: { url: mediaUrl },
      },
    ];
  } else {
    // Fallback for video links (since raw video isn't universally supported in this model format yet)
    contentPayload = [
      {
        type: 'text',
        text: `I have a marketing video at this URL: ${mediaUrl}
Please provide a speculative analysis based strictly on typical marketing videos in this domain. Provide the output strictly as a JSON object with four keys:
1. "content": Likely objects/products featured.
2. "ocrText": "Unable to extract text from raw video link without frames."
3. "summary": A brief summary of what this video might convey or a general description based on the URL context.
4. "audience": The likely target audience demographic.
Ensure the response is ONLY valid JSON.`,
      },
    ];
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an expert AI Marketing Analyst capable of profound computer vision analysis.',
    },
    {
      role: 'user',
      content: contentPayload,
    },
  ];

  const resultStr = await chatComplete(messages, 600);
  if (!resultStr) throw new Error('AI returned empty response.');

  // Extract JSON from potential markdown code block
  const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
  const cleanJsonStr = jsonMatch ? jsonMatch[0] : resultStr;

  try {
    return JSON.parse(cleanJsonStr);
  } catch (err) {
    console.error('[aiMarketingService] Failed to parse AI JSON:', resultStr);
    throw new Error('AI returned an invalid format.');
  }
}

/**
 * Generate SEO data for a product (SEO Title, Meta Desc, Keywords, ALT Text)
 * @param {Object} data - { name, description, category, brand }
 */
export async function generateProductSeoData({ name, description, category, brand }) {
  const contentPayload = [
    {
      type: 'text',
      text: `Generate SEO metadata for an e-commerce product. Return the output STRICTLY as a JSON object with these exact four keys:
1. "metaTitle": A compelling SEO title (max 60 chars).
2. "metaDescription": A concise, persuasive meta description (max 155 chars).
3. "keywords": A comma-separated list of 5-8 highly relevant search keywords.
4. "altText": A short, descriptive ALT text for the product image (max 12 words).

Product Details:
Name: ${name || 'Unknown'}
Brand: ${brand || 'Unknown'}
Category: ${category || 'Unknown'}
Description: ${description ? description.replace(/<[^>]+>/g, '').substring(0, 300) : 'None'}

Ensure the response is ONLY valid JSON.`,
    },
  ];

  const messages = [
    {
      role: 'system',
      content: 'You are an expert SEO copywriter and e-commerce specialist.',
    },
    {
      role: 'user',
      content: contentPayload,
    },
  ];

  const resultStr = await chatComplete(messages, 400);
  if (!resultStr) throw new Error('AI returned empty response.');

  const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
  const cleanJsonStr = jsonMatch ? jsonMatch[0] : resultStr;

  try {
    return JSON.parse(cleanJsonStr);
  } catch (err) {
    console.error('[aiMarketingService] Failed to parse AI JSON:', resultStr);
    throw new Error('AI returned an invalid format.');
  }
}
