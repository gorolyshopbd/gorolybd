
# Python script to insert Test SMS block into AdminDashboard.js (LF version)
filepath = r'c:\Users\user\Desktop\mern stack\frontend\src\components\AdminDashboard.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '                    </div>\n                  </div>\n                )}\n\n                {/* Email (Gmail SMTP) Credentials */}'

new_block = '''                    </div>
                  </div>
                  {/* Test SMS Button */}
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-[11px] font-bold text-orange-800 mb-3">&#128241; Live Test - আপনার মোবাইলে এখনই SMS পাঠান</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        id="sms-test-phone"
                        placeholder="01XXXXXXXXX"
                        className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        type="button"
                        id="sms-test-btn"
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
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap"
                      >Test SMS</button>
                    </div>
                    <div id="sms-test-result" className="mt-2 text-xs font-semibold"></div>
                  </div>
                )}

                {/* Email (Gmail SMTP) Credentials */}'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Test SMS block inserted")
else:
    print("BLOCK NOT FOUND. Showing 5 chars around expected location:")
    idx = content.find('Email (Gmail SMTP) Credentials')
    print(repr(content[idx-200:idx+50]))
