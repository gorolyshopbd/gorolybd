import paramiko
import sys

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose logs --tail=100 backend')
    with open('backend_logs.txt', 'wb') as f:
        f.write(stdout.read())
        
except Exception as e:
    print(f"Error: {e}")
c.close()
