import paramiko, sys
import os

os.environ['PYTHONIOENCODING'] = 'utf-8'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@')

# Restart containers
stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose up -d 2>&1')
stdout.read()  # wait for completion, ignore output encoding issues

# Check container status
stdin2, stdout2, stderr2 = c.exec_command('docker ps --format "{{.Names}} | {{.Status}}"')
status = stdout2.read().decode('utf-8', errors='replace')
print(status)

c.close()
