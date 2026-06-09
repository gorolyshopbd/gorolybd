import paramiko
import os, urllib.request, json, ssl

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    sftp.put(os.path.join(base, 'backend/config/db.js'), '/opt/shopio/backend/config/db.js')
    print("OK: db.js uploaded")
    sftp.close()
    
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=180)
    err = stderr.read().decode('utf-8', errors='replace')
    print("STDERR:", err[-300:])
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()

# Test endpoints
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

endpoints = [
    'https://gorolyshop.com/api/products',
    'https://gorolyshop.com/api/categories',
    'https://gorolyshop.com/api/videos',
]

import time
time.sleep(5)
for url in endpoints:
    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, context=ctx, timeout=10)
        data = resp.read().decode('utf-8')[:100]
        print(f"OK [{resp.getcode()}]: {url} -> {data}")
    except Exception as e:
        print(f"FAIL: {url} -> {e}")
