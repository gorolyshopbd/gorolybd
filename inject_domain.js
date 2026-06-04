const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/AdminDashboard.js');
let content = fs.readFileSync(filePath, 'utf8');

// Inject Custom Domain States
if (!content.includes('customDomainValue')) {
  content = content.replace(
    'const [showAutomationGuide, setShowAutomationGuide] = useState(false);',
    `const [showAutomationGuide, setShowAutomationGuide] = useState(false);
  // Custom Domain States
  const [customDomainValue, setCustomDomainValue] = useState(user?.customDomain || '');
  const [customDomainSaving, setCustomDomainSaving] = useState(false);
  const [customDomainMsg, setCustomDomainMsg] = useState('');
  const [customDomainErr, setCustomDomainErr] = useState('');`
  );
}

// Inject Menu Item
if (!content.includes("id: 'seller_custom_domain'")) {
  content = content.replace(
    "{ id: 'seller_own_profile', label: 'My Profile', icon: Settings, sellerOnly: true },",
    `{ id: 'seller_custom_domain', label: 'Custom Domain', icon: Globe, sellerOnly: true },
            { id: 'seller_own_profile', label: 'My Profile', icon: Settings, sellerOnly: true },`
  );
}

// Inject Tab Render Block
if (!content.includes("activeTab === 'seller_custom_domain'")) {
  const customDomainTab = `
      {activeTab === 'seller_custom_domain' && (
        <div className="space-y-6 max-w-3xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe size={22} className="text-[#FF6600]" /> Custom Domain Setup
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Connect your own domain (e.g. <span className="font-semibold text-gray-600">shop.yourbrand.com</span>) to your seller storefront.
            </p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Enter Domain', desc: 'Type your custom domain below and save it.', color: 'blue' },
              { step: '2', title: 'Update DNS', desc: 'Add a CNAME record pointing to gorolyshop.com in your domain provider.', color: 'orange' },
              { step: '3', title: 'Go Live!', desc: 'Wait 24–48 hours for DNS propagation. Your store will be live on your domain.', color: 'emerald' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mb-3 \${
                  color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  color === 'orange' ? 'bg-orange-50 text-[#FF6600]' :
                  'bg-emerald-50 text-emerald-600'
                }\`}>{step}</div>
                <h3 className="font-black text-slate-900 text-sm">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* DNS Setup Guide */}
          <div className="bg-slate-900 rounded-2xl p-5 text-sm">
            <h3 className="text-white font-black mb-3 flex items-center gap-2">
              <span className="text-[#FF6600]">DNS</span> Configuration Guide
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs font-bold border-b border-slate-700">
                    <th className="pb-2 pr-6">Type</th>
                    <th className="pb-2 pr-6">Host / Name</th>
                    <th className="pb-2">Value / Points To</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 text-xs font-mono">
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-6 text-[#FF6600] font-bold">CNAME</td>
                    <td className="py-2 pr-6">shop <span className="text-slate-500">(or www)</span></td>
                    <td className="py-2 text-emerald-400">gorolyshop.com</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 text-blue-400 font-bold">A</td>
                    <td className="py-2 pr-6">@ <span className="text-slate-500">(root)</span></td>
                    <td className="py-2 text-emerald-400">Your Server IP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Domain Save Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-sm mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
              Your Custom Domain
              <span className={\`px-3 py-1 rounded-xl text-[10px] font-black \${user?.customDomain ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}\`}>
                {user?.customDomain ? 'Configured' : 'Not Set'}
              </span>
            </h2>

            {user?.customDomain && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <Globe size={16} className="text-[#FF6600] flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Current Domain</p>
                  <a href={\`https://\${user.customDomain}\`} target="_blank" rel="noreferrer" className="text-sm font-black text-blue-600 hover:underline">{user.customDomain}</a>
                </div>
              </div>
            )}

            {customDomainErr && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {customDomainErr}
              </div>
            )}
            {customDomainMsg && (
              <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} /> {customDomainMsg}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCustomDomainErr('');
                setCustomDomainMsg('');
                const domain = customDomainValue.trim().replace(/^https?:\\/\\//, '').replace(/\\/+$/, '');
                if (!domain) return setCustomDomainErr('Please enter a valid domain name.');
                if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\\.[a-zA-Z]{2,}$/.test(domain)) {
                  return setCustomDomainErr('Invalid domain format. Example: shop.yourbrand.com');
                }
                setCustomDomainSaving(true);
                try {
                  const res = await fetch(\`\${API_URL}/users/profile\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${user.token}\` },
                    body: JSON.stringify({ customDomain: domain }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'Failed to save domain.');
                  const updatedUser = { ...user, customDomain: domain };
                  localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                  localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  setCustomDomainMsg('Custom domain saved! Update your DNS records to go live.');
                } catch (err) {
                  setCustomDomainErr(err.message || 'Failed to save domain.');
                } finally {
                  setCustomDomainSaving(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Domain Name</label>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#FF6600] focus-within:ring-2 focus-within:ring-[#FF6600]/20 transition">
                    <span className="px-3 text-slate-400 text-sm font-semibold border-r border-slate-200 h-full flex items-center bg-slate-100 select-none">https://</span>
                    <input
                      type="text"
                      value={customDomainValue}
                      onChange={(e) => setCustomDomainValue(e.target.value)}
                      placeholder="shop.yourbrand.com"
                      className="flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-gray-900 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={customDomainSaving}
                    className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {customDomainSaving ? 'Saving...' : 'Save Domain'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Enter domain without https:// e.g. <span className="font-semibold">shop.mybrand.com</span></p>
              </div>

              {customDomainValue && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 font-semibold flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>After saving, add a <strong>CNAME</strong> record for <strong>{customDomainValue.replace(/^https?:\\/\\//, '').split('/')[0]}</strong> pointing to <strong>gorolyshop.com</strong> in your DNS provider (Namecheap, GoDaddy, Cloudflare, etc.).</span>
                </div>
              )}
            </form>
          </div>

          {/* Remove Domain */}
          {user?.customDomain && (
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-red-600 text-sm mb-2">Remove Custom Domain</h3>
              <p className="text-sm text-slate-500 mb-4">This will disconnect your custom domain. Your store will revert to the default URL.</p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Remove your custom domain?')) return;
                  setCustomDomainSaving(true);
                  try {
                    const res = await fetch(\`\${API_URL}/users/profile\`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${user.token}\` },
                      body: JSON.stringify({ customDomain: '' }),
                    });
                    if (res.ok) {
                      const updatedUser = { ...user, customDomain: '' };
                      localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                      localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                      setUser(updatedUser);
                      setCustomDomainValue('');
                      setCustomDomainMsg('Custom domain removed successfully.');
                    }
                  } catch (err) {
                    setCustomDomainErr(err.message);
                  } finally {
                    setCustomDomainSaving(false);
                  }
                }}
                className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition"
              >
                Remove Domain
              </button>
            </div>
          )}
        </div>
      )}
`;
  content = content.replace(
    "{activeTab === 'seller_own_profile' && (",
    customDomainTab + "\n      {activeTab === 'seller_own_profile' && ("
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Custom Domain successfully injected!');
