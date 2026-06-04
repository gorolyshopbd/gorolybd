const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/AdminDashboard.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject Logic
if (!content.includes('const handleGenerateSeo = async (e, isEdit = false) => {')) {
  content = content.replace(
    '  const handleUpdateStatus = async (orderId, status) => {',
    `  const handleGenerateSeo = async (e, isEdit = false) => {
    e.preventDefault();
    const productData = isEdit ? editForm : newProduct;
    if (!productData.name) return alert('Please enter a Product Name first.');

    setAiMarketingLoading(true);
    try {
      const res = await fetch(\`\${API_URL}/marketing/generate-seo\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${user.token}\` },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          brand: productData.brand
        }),
      });
      if (res.ok) {
        const seo = await res.json();
        if (isEdit) {
          setEditForm(prev => ({
            ...prev,
            metaTitle: seo.metaTitle || prev.metaTitle,
            metaDescription: seo.metaDescription || prev.metaDescription,
            metaKeywords: seo.keywords || prev.metaKeywords,
            metaImageAlt: seo.altText || prev.metaImageAlt,
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            metaTitle: seo.metaTitle || prev.metaTitle,
            metaDescription: seo.metaDescription || prev.metaDescription,
            metaKeywords: seo.keywords || prev.metaKeywords,
            metaImageAlt: seo.altText || prev.metaImageAlt,
          }));
        }
        alert('✨ SEO Data generated successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to generate SEO.');
      }
    } catch (err) {
      alert(err.message || 'Error connecting to AI service.');
    } finally {
      setAiMarketingLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {`
  );
}

// 2. Inject Add Product Button
if (!content.includes('Auto Generate AI SEO') && content.includes('<h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">SEO Settings</h3>')) {
  content = content.replace(
    '<h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">SEO Settings</h3>',
    `<div className="flex items-center justify-between border-b border-slate-100 pb-3">
  <h3 className="font-bold text-gray-900 text-sm">SEO Settings</h3>
  <button
    type="button"
    onClick={(e) => handleGenerateSeo(e, false)}
    disabled={aiMarketingLoading}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 cursor-pointer"
  >
    <Sparkles size={14} />
    {aiMarketingLoading ? 'Generating...' : 'Auto Generate AI SEO'}
  </button>
</div>`
  );
}

// 3. Inject Edit Product Button
if (!content.includes('Auto Generate AI SEO') && content.includes('<h3 className="font-bold text-gray-900 text-sm">SEO Search Optimization Settings</h3>')) {
  content = content.replace(
    `<div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">SEO Search Optimization Settings</h3>
                  </div>`,
    `<div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">SEO Search Optimization Settings</h3>
                    <button
                      type="button"
                      onClick={(e) => handleGenerateSeo(e, true)}
                      disabled={aiMarketingLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      {aiMarketingLoading ? 'Generating...' : 'Auto Generate AI SEO'}
                    </button>
                  </div>`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SEO Buttons successfully injected!');
