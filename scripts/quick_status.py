import paramiko
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)

print("=== Container Status ===")
stdin, stdout, stderr = c.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Nginx Status ===")
stdin, stdout, stderr = c.exec_command('docker exec shopio-nginx nginx -t 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Port 80/443 Listening? ===")
stdin, stdout, stderr = c.exec_command('ss -tlnp | grep -E "80|443"')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Nginx Logs (last 10) ===")
stdin, stdout, stderr = c.exec_command('docker logs shopio-nginx --tail=10 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Deploy Build Status ===")
stdin, stdout, stderr = c.exec_command('cat /tmp/deploy_status.txt 2>/dev/null || echo STILL BUILDING')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Frontend Build Log (last 15 lines) ===")
stdin, stdout, stderr = c.exec_command('tail -15 /tmp/build_frontend.log 2>/dev/null')
print(stdout.read().decode('utf-8', errors='replace'))

c.close()
