import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    cmd = 'find / -name "docker-compose.yml" 2>/dev/null | grep shopio || find / -name "settingsController.js" 2>/dev/null'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print("Found files:", out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
