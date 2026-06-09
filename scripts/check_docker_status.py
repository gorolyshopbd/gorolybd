import paramiko
import sys

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose ps -a')
    print("--- DOCKER PS ---")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose logs --tail=50 frontend')
    print("\n--- FRONTEND LOGS ---")
    print(stdout.read().decode('utf-8', errors='replace'))
    
except Exception as e:
    print(f"Error: {e}")
c.close()
