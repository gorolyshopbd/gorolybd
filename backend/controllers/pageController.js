import { db } from '../config/db.js';

const ensureDefaultPagesExist = async () => {
  try {
    const defaults = [
      {
        title: 'About Us',
        slug: 'about-us',
        content: `<h2>About Goroly Shop</h2>
<p>Goroly Shop is a rapidly growing e-commerce brand in Bangladesh, committed to providing premium, authentic products with fast and reliable doorstep delivery. We believe that online shopping should be simple, trustworthy, and convenient for everyone.</p>
<h3>Our Mission</h3>
<p>Our mission is to deliver high-quality products that bring value and satisfaction to our customers. From everyday essentials to unique finds, every item in our store is carefully selected to ensure quality and authenticity.</p>
<h3>Our Vision</h3>
<p>At Goroly Shop, customer satisfaction is at the heart of everything we do. We focus on fast delivery, secure ordering, and responsive customer support to give you a smooth and enjoyable shopping experience.</p>
<p>We are continuously improving and expanding our product range to meet the evolving needs of our customers across Bangladesh.</p>`,
        is_published: true
      },
      {
        title: 'Terms & Conditions',
        slug: 'terms-&-conditions',
        content: `<h2>Terms & Conditions – Goroly Shop</h2>
<p>Welcome to Goroly Shop. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.</p>
<p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
<p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

<h3>1. General</h3>
<p>By using this website, you confirm that you are at least 18 years old or using it under the supervision of a parent or guardian. We reserve the right to update or change these terms at any time without prior notice.</p>

<h3>2. Products & Services</h3>
<p>All products listed on Goroly Shop are subject to availability. We reserve the right to limit quantities, discontinue products, or change pricing at any time without notice.</p>

<h3>3. Pricing & Payments</h3>
<p>All prices are listed in BDT. We accept payments via Cash on Delivery / Mobile Banking / Card. Orders will be processed only after payment confirmation (if applicable).</p>

<h3>4. Orders & Confirmation</h3>
<p>After placing an order, you will receive a confirmation message. Goroly Shop reserves the right to cancel or refuse any order due to stock issues, incorrect pricing, or suspicious activity.</p>

<h3>5. Shipping & Delivery</h3>
<p>Cash on delivery all over Bangladesh, Full payment in advance for Sundarban courier delivery. Delivery charges in Dhaka are BDT 70 per 1kg , and outside Dhaka are BDT 130 per 1 kg. It takes 48-72 hours to deliver the Parcel. Delivery agents are Steadfast , Pathao, E-courier, Redx, and Shundarban courier service.</p>

<h3>Exchange Terms and Conditions</h3>
<p>After purchasing from Gorolyshop Website or App, customers can claim an exchange. Please follow the following instructions:</p>
<ol>
  <li>Products must be in their original condition. Exchange within 3 days.</li>
  <li>Items should be unused and intact to be eligible for exchange.</li>
  <li>Exchange is only applicable for stock. If the stock is unavailable, the client can choose another product for the exchange within a similar or higher price range.</li>
  <li>There will be no monetary compensation for the exchange.</li>
  <li>Exchange is not applicable on products purchased during the sale.</li>
  <li>If the customer gets any cashback at the time of payment, the cashback amount will be deducted while making the refund.</li>
  <li>The customer must ensure the item is packed and delivered securely. Gorolyshop not be held responsible if the goods get damaged on their return to the Gorolyshop warehouse.</li>
  <li>With order ID details and problems, e-mail us info@gorolyshop.com within 12 hours. We will confirm the return request and inform you about the pickup process.</li>
</ol>

<h3>6. Returns & Refunds policies</h3>
<p>Our products are packaged with great care and go through a rigorous quality check before they are shipped. If you receive products that have flaws, Damage or Broken, you can return them or request that the product be exchanged.</p>
<h4>Returns policies:</h4>
<ol>
  <li>Return is free within 3 days of purchase.</li>
  <li>If the Return is claimed after 3 days Gorolyshop will not take any responsibilities.</li>
  <li>Customers can return the products that they do not like. In that case, they have to bear the delivery charges.</li>
  <li>If the product is damaged or broken while delivering the product, you must call and inform us in front of the Deliveryman. You can call us at 01313924485 or send an email to info@gorolyshop.com. No such complaint will be admissible after the delivery man has left.</li>
  <li>If the product or number is not correct while receiving the product, call and inform us in front of the delivery man. We will deliver the missing products within 24-72 hours without any extra delivery charge.</li>
</ol>
<h4>Refunds policies:</h4>
<ol>
  <li>Refund from returns - Refund is processed once your item is returned to the warehouse and QC is completed.</li>
  <li>Refunds from cancelled orders - Refund is automatically triggered once cancelation is successfully processed.</li>
  <li>In case of any refund, the received cash back amount, if any, will be adjusted with the refund amount.</li>
</ol>
<p>No cancellation on order or refund after order confirmation (pre-order): Once confirmed, the payment must be made. We won’t be able to exchange, refund, or accept any cancellation as the product is pre-order or booked during sale time.</p>

<h3>7. User Responsibilities</h3>
<p>You agree not to misuse the website, including: Providing false information, Attempting to harm or hack the website, Using the site for illegal purposes.</p>

<h3>8. Intellectual Property</h3>
<p>All content on this website (logos, images, text) is the property of Goroly Shop and may not be used without permission.</p>

<h3>9. Limitation of Liability</h3>
<p>Goroly Shop shall not be liable for any indirect or incidental damages resulting from the use of our website or products.</p>

<h3>10. Privacy</h3>
<p>Your personal information is handled according to our Privacy Policy.</p>

<h3>11. Governing Law</h3>
<p>These terms are governed by the laws of Bangladesh.</p>

<h3>12. Contact Us</h3>
<p>If you have any questions about these Terms & Conditions, please contact us: Email: info@gorolyshop.com, Phone +8801313924485.</p>`,
        is_published: true
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: `<h2>Privacy Policy – Goroly Shop</h2>
<p>At Goroly Shop, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website.</p>

<h3>1. Information We Collect</h3>
<ul>
  <li><strong>Personal Information:</strong> Name, phone number, email address, shipping address</li>
  <li><strong>Payment Information:</strong> Payment method details (we do not store sensitive payment data)</li>
  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
  <li><strong>Usage Data:</strong> Pages visited, time spent on the website</li>
</ul>

<h3>2. How We Use Your Information</h3>
<ul>
  <li>Process and deliver your orders</li>
  <li>Communicate with you about your order</li>
  <li>Improve our website and services</li>
  <li>Send promotional offers (only if you agree)</li>
</ul>

<h3>3. Payment & Cash on Delivery (COD)</h3>
<p>We offer Cash on Delivery (COD) across Bangladesh. For COD orders, we may contact you via phone to confirm your order. We also accept bKash, Nagad, and Rocket payments for advance orders. We do not store sensitive financial information.</p>

<h3>4. Sharing Your Information</h3>
<p>We do not sell or trade your personal information. We only share necessary data with trusted third parties, such as courier partners (e.g., Pathao, Steadfast, Sundarban Courier) for delivery, payment providers, and government authorities if legally required.</p>

<h3>5. Cookies</h3>
<p>Our website may use cookies to enhance your browsing experience. Cookies help us understand user behavior and improve our services. You can disable cookies in your browser settings.</p>

<h3>6. Data Security</h3>
<p>We take appropriate measures to protect your personal data from unauthorized access, loss, or misuse. However, no online system is 100% secure.</p>

<h3>7. Your Rights</h3>
<ul>
  <li>Access your personal data</li>
  <li>Request correction of incorrect information</li>
  <li>Request deletion of your data</li>
</ul>

<h3>8. Third-Party Links</h3>
<p>Our website may contain links to other websites. We are not responsible for the privacy practices of those sites.</p>

<h3>9. Children’s Privacy</h3>
<p>Our website is not intended for individuals under 13 years of age. We do not knowingly collect data from children.</p>

<h3>10. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>

<h3>11. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us: Email: support@gorolyshop.com, Phone: +8801313924485.</p>`,
        is_published: true
      },
      {
        title: 'Return & Refund Policy',
        slug: 'return-refund-policy',
        content: `<h2>Return & Refund Policy – Goroly Shop</h2>
<p>At Goroly Shop, we strive to ensure a smooth shopping experience. If you are not satisfied with your purchase or received a damaged item, we are here to help.</p>

<h3>Shipping & Delivery Info</h3>
<ul>
  <li>Cash on delivery is available all over Bangladesh. Full payment in advance is required for Sundarban courier delivery.</li>
  <li>Delivery charges inside Dhaka are BDT 70 (up to 1kg), and outside Dhaka are BDT 130 (up to 1kg). Normal delivery takes 48-72 hours.</li>
  <li>Our delivery partners are Steadfast, Pathao, E-courier, Redx, and Sundarban courier service.</li>
</ul>

<h3>Exchange Terms & Conditions</h3>
<ol>
  <li>Products must be in their original condition and requested within 3 days of delivery.</li>
  <li>Items should be unused, unwashed, and intact with all tags attached to be eligible for exchange.</li>
  <li>Exchange is subject to stock availability. If the stock is unavailable, you can choose another product of a similar or higher price range.</li>
  <li>There is no monetary/cash compensation for exchanges.</li>
  <li>Exchange is not applicable on promotional products purchased during sales/campaigns.</li>
  <li>If any cashback was received during payment, it will be adjusted/deducted during the return/refund process.</li>
  <li>Email us at info@gorolyshop.com with your Order ID and issues within 12 hours of delivery. We will verify the request and guide you on the pickup.</li>
</ol>

<h3>Return Guidelines</h3>
<p>Our products are packaged with great care and undergo a rigorous quality check before shipping. If you receive a flawed, damaged, or broken item, you can request a return/exchange.</p>
<ul>
  <li>Returns are free within 3 days of purchase.</li>
  <li>Goroly Shop will not accept return claims submitted after 3 days.</li>
  <li>If you want to return a product simply because you do not like it, you must bear the return delivery charges.</li>
  <li>If a product is damaged or broken during delivery, you must call and inform us immediately in front of the delivery agent at 01313924485 or email info@gorolyshop.com. No complaints will be accepted after the delivery agent has left.</li>
  <li>If the invoice details do not match the products received, notify us in front of the delivery agent. We will deliver the missing products within 24-72 hours with no extra delivery charge.</li>
</ul>

<h3>Refund Processing</h3>
<ol>
  <li>Refund from returns: Processed once your item reaches our warehouse and Quality Control (QC) is completed successfully.</li>
  <li>Refunds from cancelled orders: Automatically triggered once cancellation is processed successfully.</li>
  <li>Any cashback received during payment will be adjusted and deducted from the refund amount.</li>
  <li>Pre-orders & Sale Items: No cancellation, refund, or exchange is allowed once a pre-order is confirmed or booked during sale campaigns.</li>
</ol>

<h3>Need Help with a Return?</h3>
<p>If you have any questions, contact us: Email: info@gorolyshop.com, Phone: +8801313924485.</p>`,
        is_published: true
      }
    ];

    for (const page of defaults) {
      const { data: existing } = await db.database.from('pages').select('id').eq('slug', page.slug).single();
      if (!existing) {
        await db.database.from('pages').insert(page);
      }
    }
  } catch (err) {
    console.error('Error seeding default pages:', err);
  }
};

export const getPages = async (req, res) => {
  try {
    await ensureDefaultPagesExist();
    const { data: pages, error } = await db.database.from('pages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = pages.map(p => ({
      ...p,
      _id: p.id,
      isPublished: p.is_published
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPageBySlug = async (req, res) => {
  try {
    const { data: page, error } = await db.database.from('pages').select('*').eq('slug', req.params.slug).eq('is_published', true).single();
    if (error || !page) return res.status(404).json({ message: 'Page not found' });
    
    res.json({ ...page, _id: page.id, isPublished: page.is_published });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    
    const { data: existing } = await db.database.from('pages').select('id').eq('slug', slug).single();
    if (existing) return res.status(400).json({ message: 'Slug already exists' });
    
    const { data: page, error } = await db.database.from('pages').insert({
      title,
      slug,
      content,
      is_published: isPublished !== undefined ? isPublished : false
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...page, _id: page.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.is_published = isPublished;
    
    const { data: page, error } = await db.database.from('pages').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !page) return res.status(404).json({ message: 'Page not found' });
    res.json({ ...page, _id: page.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { error } = await db.database.from('pages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicPages = async (req, res) => {
  try {
    await ensureDefaultPagesExist();
    const { data: pages, error } = await db.database.from('pages').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = pages.map(p => ({
      ...p,
      _id: p.id,
      isPublished: p.is_published
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
