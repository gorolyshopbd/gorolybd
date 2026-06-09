import urllib.request, re

r = urllib.request.urlopen('http://sms.sasbulksms.com/')
html = r.read().decode('utf-8', errors='replace')

for m in re.finditer(r'src="([^"]+\.js[^"]*)"', html):
    js_url = m.group(1)
    if js_url.startswith('/'):
        js_url = 'http://sms.sasbulksms.com' + js_url
    elif not js_url.startswith('http'):
        js_url = 'http://sms.sasbulksms.com/' + js_url
    print('JS:', js_url)
    try:
        r2 = urllib.request.urlopen(js_url)
        js = r2.read().decode('utf-8', errors='replace')
        for api in re.finditer(r'(?:api_key|senderid|destination|mobile|number|message|sendtext|/send)[^,}]*', js):
            line = api.group(0)
            if len(line) > 3:
                print('  Found:', line[:120])
    except Exception as e:
        print('  Error:', e)
