import { supabase } from './config/db.js';

async function seedPages() {
  const pages = [
    {
      title: 'About Us',
      slug: 'about-us',
      content: '<h1>About Shopio</h1><p>Welcome to Shopio! We are the best eCommerce platform in the world.</p>',
      is_published: true
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: '<h1>Terms & Conditions</h1><p>By using our site, you agree to our terms.</p>',
      is_published: true
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: '<h1>Privacy Policy</h1><p>We respect your privacy and will not share your data.</p>',
      is_published: true
    }
  ];

  for (const page of pages) {
    const { data: existing } = await supabase.from('pages').select('id').eq('slug', page.slug).single();
    if (!existing) {
      const { error } = await supabase.from('pages').insert(page);
      if (error) {
        console.error(`Failed to insert ${page.slug}:`, error.message);
      } else {
        console.log(`Successfully created page: ${page.slug}`);
      }
    } else {
      console.log(`Page already exists: ${page.slug}`);
    }
  }
}

seedPages().then(() => process.exit(0));
