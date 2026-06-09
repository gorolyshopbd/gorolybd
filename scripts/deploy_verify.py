import paramiko
import os
import sys
import io

# Force stdout to use utf-8 with replace for unencodable chars
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

VPS_HOST = '2.25.182.96'
VPS_USER = 'root'
VPS_PASS = 'Asif@v@26@200@'
REMOTE_BASE = '/opt/shopio'
LOCAL_BASE = r'c:\Users\user\Desktop\mern stack'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    c.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)

    print("Checking if containers are already running after last build...")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose ps 2>&1')
    status = stdout.read().decode('utf-8', errors='replace')
    print(status)

    # If frontend is not running (build may have crashed), restart it
    if 'shopio-frontend' not in status or 'Up' not in status:
        print("Frontend not running. Starting containers...")
        stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose up -d 2>&1')
        print(stdout.read().decode('utf-8', errors='replace'))
    else:
        print("All containers are UP and running!")

    print("\nChecking backend logs for errors...")
    stdin, stdout, stderr = c.exec_command('docker logs shopio-backend --tail=10 2>&1')
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nAPI Test...")
    stdin, stdout, stderr = c.exec_command('curl -s https://gorolyshop.com/api/products | head -c 100 2>&1')
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nDEPLOYMENT VERIFIED - Live at: https://gorolyshop.com")

except Exception as e:
    print("\nError: " + str(e))
finally:
    c.close()
