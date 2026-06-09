
# Fix the broken SMS section in AdminDashboard.js
filepath = r'c:\Users\user\Desktop\mern stack\frontend\src\components\AdminDashboard.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The broken section starts at the opening of the SMS conditional 
# and ends with the closing )}
# We find the broken text and replace the whole block

broken = """{settings.otpGateway === 'SMS' && (
                        onChange={(e) => setSettings({ ...settings, sasSmsGatewayUrl: e.target.value })}
                        placeholder=\"http://sms.sasbulksms.com\"
                        className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                      />
                    </div>
                    <div>
                      <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">API Token</label>
                      <input
                        type=\"text\"
                        value={settings.sasSmsApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, sasSmsApiKey: e.target.value })}
                        placeholder=\"API Token (e.g. 7639814fe75b2cbd)\"
                        className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                      />
                    </div>
                    <div>
                      <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">Secret Key</label>
                      <input
                        type=\"text\"
                        value={settings.sasSmsSecretKey || ''}
                        onChange={(e) => setSettings({ ...settings, sasSmsSecretKey: e.target.value })}
                        placeholder=\"Secret Key (e.g. 13382300000000)\"
                        className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                      />
                    </div>
                    <div>
                      <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">Sender ID</label>
                      <input
                        type=\"text\"
                        value={settings.sasSmsSenderId || ''}
                        onChange={(e) => setSettings({ ...settings, sasSmsSenderId: e.target.value })}
                        placeholder=\"Sender ID (e.g. 8809617633299)\"
                        className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                      />
                    </div>
                  </div>
                  {/* Test SMS Button */}
                  <div className=\"mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl\">
                    <p className=\"text-[11px] font-bold text-orange-800 mb-3\">&#128241; Live Test - আপনার মোবাইলে এখনই SMS পাঠান</p>
                    <div className=\"flex gap-2\">
                      <input
                        type=\"tel\"
                        id=\"sms-test-phone\"
                        placeholder=\"01XXXXXXXXX\"
                        className=\"flex-1 px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400\"
                      />
                      <button
                        type=\"button\"
                        id=\"sms-test-btn\"
                        onClick={async () => {
                          const phoneInput = document.getElementById('sms-test-phone');
                          const phone = phoneInput?.value?.trim();
                          if (!phone) { alert('আপনার মোবাইল নম্বর দিন'); return; }
                          const btn = document.getElementById('sms-test-btn');
                          btn.disabled = true; btn.textContent = 'Sending...';
                          const resultDiv = document.getElementById('sms-test-result');
                          resultDiv.textContent = ''; resultDiv.className = 'mt-2 text-xs font-semibold';
                          try {
                            const res = await fetch(`${API_URL}/settings/test-sms`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                              body: JSON.stringify({ toNumber: phone, apiKey: settings.sasSmsApiKey, secretKey: settings.sasSmsSecretKey, senderId: settings.sasSmsSenderId, gatewayUrl: settings.sasSmsGatewayUrl }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              resultDiv.className = 'mt-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200';
                              resultDiv.textContent = '\u2705 ' + data.message;
                            } else {
                              resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200 whitespace-pre-wrap';
                              resultDiv.textContent = '\u274c ' + data.message + (data.raw ? '\\nGateway: ' + data.raw : '');
                            }
                          } catch (err) {
                            resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200';
                            resultDiv.textContent = '\u274c Error: ' + err.message;
                          } finally { btn.disabled = false; btn.textContent = 'Test SMS'; }
                        }}
                        className=\"px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap\"
                      >Test SMS</button>
                    </div>
                    <div id=\"sms-test-result\" className=\"mt-2 text-xs font-semibold\"></div>
                  </div>
                )}"""

fixed = """{settings.otpGateway === 'SMS' && (
                  <div>
                    <div className=\"border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm\">
                      <div>
                        <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">Gateway URL</label>
                        <input
                          value={settings.sasSmsGatewayUrl || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsGatewayUrl: e.target.value })}
                          placeholder=\"http://sms.sasbulksms.com\"
                          className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                        />
                      </div>
                      <div>
                        <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">API Token</label>
                        <input
                          type=\"text\"
                          value={settings.sasSmsApiKey || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsApiKey: e.target.value })}
                          placeholder=\"API Token (e.g. 7639814fe75b2cbd)\"
                          className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                        />
                      </div>
                      <div>
                        <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">Secret Key</label>
                        <input
                          type=\"text\"
                          value={settings.sasSmsSecretKey || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsSecretKey: e.target.value })}
                          placeholder=\"Secret Key (e.g. 13382300000000)\"
                          className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                        />
                      </div>
                      <div>
                        <label className=\"text-[10px] font-bold text-gray-500 uppercase tracking-wider\">Sender ID</label>
                        <input
                          type=\"text\"
                          value={settings.sasSmsSenderId || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsSenderId: e.target.value })}
                          placeholder=\"Sender ID (e.g. 8809617633299)\"
                          className=\"w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold\"
                        />
                      </div>
                    </div>
                    <div className=\"mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl\">
                      <p className=\"text-[11px] font-bold text-orange-800 mb-3\">&#128241; Live Test - Send SMS to your phone now</p>
                      <div className=\"flex gap-2\">
                        <input
                          type=\"tel\"
                          id=\"sms-test-phone\"
                          placeholder=\"01XXXXXXXXX\"
                          className=\"flex-1 px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400\"
                        />
                        <button
                          type=\"button\"
                          id=\"sms-test-btn\"
                          onClick={async () => {
                            const phoneInput = document.getElementById('sms-test-phone');
                            const phone = phoneInput?.value?.trim();
                            if (!phone) { alert('Please enter your mobile number'); return; }
                            const btn = document.getElementById('sms-test-btn');
                            btn.disabled = true; btn.textContent = 'Sending...';
                            const resultDiv = document.getElementById('sms-test-result');
                            resultDiv.textContent = ''; resultDiv.className = 'mt-2 text-xs font-semibold';
                            try {
                              const res = await fetch(API_URL + '/settings/test-sms', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + user.token },
                                body: JSON.stringify({ toNumber: phone, apiKey: settings.sasSmsApiKey, secretKey: settings.sasSmsSecretKey, senderId: settings.sasSmsSenderId, gatewayUrl: settings.sasSmsGatewayUrl }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                resultDiv.className = 'mt-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200';
                                resultDiv.textContent = 'SUCCESS: ' + data.message;
                              } else {
                                resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200 whitespace-pre-wrap';
                                resultDiv.textContent = 'FAILED: ' + data.message + (data.raw ? ' | Gateway: ' + data.raw : '');
                              }
                            } catch (err) {
                              resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200';
                              resultDiv.textContent = 'Error: ' + err.message;
                            } finally { btn.disabled = false; btn.textContent = 'Test SMS'; }
                          }}
                          className=\"px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap\"
                        >Test SMS</button>
                      </div>
                      <div id=\"sms-test-result\" className=\"mt-2 text-xs font-semibold\"></div>
                    </div>
                  </div>
                )}"""

if broken in content:
    content = content.replace(broken, fixed, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Fixed SMS section")
else:
    # Try to find the broken start
    idx = content.find("{settings.otpGateway === 'SMS' && (")
    if idx >= 0:
        print("Found SMS conditional at char:", idx)
        print("Next 300 chars:")
        print(repr(content[idx:idx+300]))
    else:
        print("SMS conditional not found!")
