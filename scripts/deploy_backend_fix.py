import paramiko
import os

files_to_upload = [
    ('backend/config/db.js', '/opt/shopio/backend/config/db.js'),
    ('backend/controllers/settingsController.js', '/opt/shopio/backend/controllers/settingsController.js'),
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    for local_path, remote_path in files_to_upload:
        sftp.put(os.path.join(base, local_path), remote_path)
        print(f"Uploaded {local_path}")
        
    sftp.close()
    
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=120)
    print("STDOUT:", stdout.read().decode('utf-8', errors='replace'))
    print("STDERR:", stderr.read().decode('utf-8', errors='replace'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
