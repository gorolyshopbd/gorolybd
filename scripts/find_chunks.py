import urllib.request, re

r = urllib.request.urlopen('http://sms.sasbulksms.com/', timeout=15)
html = r.read().decode('utf-8', errors='replace')

# Find all JS files
for m in re.finditer(r'src="([^"]+\.js[^"]*)"', html):
    js_path = m.group(1)
    if js_path.startswith('/'):
        js_url = 'http://sms.sasbulksms.com' + js_path
    else:
        js_url = 'http://sms.sasbulksms.com/' + js_path
    print('JS:', js_path)
    
    # Download and search each JS file
    try:
        r2 = urllib.request.urlopen(js_url, timeout=15)
        js = r2.read().decode('utf-8', errors='replace')
        
        # Search for HTTP URLs and API endpoints
        for t in ['sendtext', '3040', 'api_key', 'senderid', 'smsapi', 'http://']:
            idx = js.find(t)
            while idx != -1:
                start = max(0, idx - 60)
                end = min(len(js), idx + 100)
                snippet = js[start:end].replace('\n', ' ').replace('\r', ' ')
                print(f'  [{t}@{idx}]: {snippet}')
                print()
                idx = js.find(t, idx + 1)
    except Exception as e:
        print('  Error:', e)
