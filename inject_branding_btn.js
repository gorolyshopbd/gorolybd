const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/AdminDashboard.js', 'utf8');
const lines = content.split('\n');

const saveBtn = [
  '                {/* Branding Save Button */}',
  '                <div className="pt-3 flex justify-end">',
  '                  <button',
  '                    type="button"',
  '                    disabled={loading}',
  '                    onClick={async () => {',
  '                      setLoading(true);',
  '                      try {',
  '                        await saveSettings(settings);',
  '                        notifySettingsUpdated(settings);',
  '                        alert(\'Branding Settings saved successfully!\');',
  '                        fetchSettings();',
  '                      } catch (err) {',
  '                        alert(err.message || \'Failed to save branding settings\');',
  '                      } finally {',
  '                        setLoading(false);',
  '                      }',
  '                    }}',
  '                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"',
  '                  >',
  '                    {loading ? (',
  '                      <span className="flex items-center gap-2">',
  '                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>',
  '                        Saving...',
  '                      </span>',
  '                    ) : (',
  '                      <span className="flex items-center gap-2">',
  '                        <Check size={15} />',
  '                        Save Branding Settings',
  '                      </span>',
  '                    )}',
  '                  </button>',
  '                </div>',
].join('\n');

// Insert before line 9128 (0-indexed 9127) - closing of space-y-3 div inside branding section
lines.splice(9127, 0, saveBtn);

fs.writeFileSync('frontend/src/components/AdminDashboard.js', lines.join('\n'), 'utf8');
console.log('Done! Save button inserted at line 9128');
