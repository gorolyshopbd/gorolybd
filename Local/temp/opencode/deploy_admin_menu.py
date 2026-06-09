import paramiko, sys, time
from scp import SCPClient
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf8', buffering=1)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.182.96', port=22, username='root', password='Asif@v@26@200@')
scp = SCPClient(ssh.get_transport())

scp.put(r'C:\Users\user\Desktop\mern stack\frontend\src\components\AdminDashboard.js', '/opt/shopio/frontend/src/components/AdminDashboard.js')
print('Copied AdminDashboard.js')

stdin, stdout, stderr = ssh.exec_command('cd /opt/shopio && docker compose build frontend 2>&1')
for line in iter(stdout.readline, ''):
    if 'exporting' in line or 'DONE' in line or 'error' in line.lower():
        print(line.strip())

stdin, stdout, stderr = ssh.exec_command('cd /opt/shopio && docker compose up -d frontend 2>&1')
print(stdout.read().decode())

time.sleep(5)
stdin, stdout, stderr = ssh.exec_command("docker ps --filter name=shopio-frontend --format '{{.Status}}'")
print('Frontend:', stdout.read().decode().strip())

ssh.close()
