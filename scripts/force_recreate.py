import paramiko
import io
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)

print("Force recreating containers with new images...")
stdin, stdout, stderr = c.exec_command(
    'cd /opt/shopio && docker compose up -d --force-recreate 2>&1'
)
print(stdout.read().decode('utf-8', errors='replace'))

time.sleep(5)

print("\n=== New Container Status ===")
stdin, stdout, stderr = c.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Backend Logs ===")
stdin, stdout, stderr = c.exec_command('docker logs shopio-backend --tail=5 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Frontend Logs ===")
stdin, stdout, stderr = c.exec_command('docker logs shopio-frontend --tail=5 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Quick API Check ===")
stdin, stdout, stderr = c.exec_command('curl -sk https://gorolyshop.com/api/products | head -c 150')
result = stdout.read().decode('utf-8', errors='replace')
if 'products' in result:
    print("API OK - Site is live!")
else:
    print("API Response: " + result)

c.close()
