const fs = require('fs');
let c = fs.readFileSync('src/components/AdminDashboard.js', 'utf8');

const replacement = `
              </div>

              {/* OTP gateway Configuration */}
              <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Sliders size={16} className="text-[#FF6600]" />
                    OTP Configuration Settings
                  </h3>
                  {/* Checkout OTP Master Toggle */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Checkout OTP Verification</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {settings.checkoutOtpEnabled ? 'ON — Phone verification required at checkout' : 'OFF — Customers checkout without OTP'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, checkoutOtpEnabled: !settings.checkoutOtpEnabled })}
                      className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 \${settings.checkoutOtpEnabled ? 'bg-[#FF6600]' : 'bg-slate-300'}\`}
                    >
                      <span className={\`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 \${settings.checkoutOtpEnabled ? 'translate-x-6' : 'translate-x-1'}\`} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mt-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Delivery Method</label>
                    <select
                      value={settings.otpGateway || 'Simulated'}
                      onChange={(e) => setSettings({ ...settings, otpGateway: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value="Simulated">Simulated (For Testing)</option>
                      <option value="SMS">SMS (SAS Bulk SMS)</option>
                      <option value="Email">Email (Gmail SMTP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Code Length</label>
                    <select
                      value={settings.otpLength}
                      onChange={(e) => setSettings({ ...settings, otpLength: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value={4}>4 Digits Code</option>
                      <option value={6}>6 Digits Code</option>
                      <option value={8}>8 Digits Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Expiry (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.otpExpiry}
                      onChange={(e) => setSettings({ ...settings, otpExpiry: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                </div>

                {/* SAS Bulk SMS Credentials */}
                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway URL</label>
                    <input
                      value={settings.sasSmsGatewayUrl || ''}`;

let idx = c.indexOf("              </div>\n                      value={settings.sasSmsGatewayUrl || ''}");
if (idx === -1) {
  idx = c.indexOf("              </div>\r\n                      value={settings.sasSmsGatewayUrl || ''}");
}

if (idx !== -1) {
  let targetLen = ("              </div>\n                      value={settings.sasSmsGatewayUrl || ''}").length;
  if (c.indexOf("              </div>\r\n                      value={settings.sasSmsGatewayUrl || ''}") !== -1) {
    targetLen = ("              </div>\r\n                      value={settings.sasSmsGatewayUrl || ''}").length;
  }
  const newStr = c.substring(0, idx) + replacement + c.substring(idx + targetLen);
  fs.writeFileSync('src/components/AdminDashboard.js', newStr);
  console.log('Fixed exactly!');
} else {
  console.log('Not found string combination.');
}
