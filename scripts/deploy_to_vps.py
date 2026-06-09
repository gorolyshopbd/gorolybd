import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    print("Connected. Restarting Docker containers...")
    
    # Run docker-compose up -d --build
    cmd = 'cd /opt/shopio && docker compose up -d --build'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=600)
    
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out)
    print("ERR:", err)
    print("Deployment to VPS complete.")
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
