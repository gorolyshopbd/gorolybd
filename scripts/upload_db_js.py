import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    sftp = c.open_sftp()
    
    local_path = r'c:\Users\user\Desktop\mern stack\backend\config\db.js'
    remote_path = '/opt/shopio/backend/config/db.js'
    
    sftp.put(local_path, remote_path)
    print(f"Uploaded db.js to {remote_path}")
        
    sftp.close()
    
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode('utf-8'))
    print("STDERR:", stderr.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
