import paramiko
import os

files_to_upload = [
    ('backend/config/db.js', '/opt/shopio/backend/config/db.js'),
    ('backend/controllers/categoryController.js', '/opt/shopio/backend/controllers/categoryController.js'),
    ('backend/controllers/payoutController.js', '/opt/shopio/backend/controllers/payoutController.js'),
    ('backend/routes/videoRoutes.js', '/opt/shopio/backend/routes/videoRoutes.js')
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    sftp = c.open_sftp()
    
    for local_path, remote_path in files_to_upload:
        abs_local = os.path.join(r'c:\Users\user\Desktop\mern stack', local_path)
        sftp.put(abs_local, remote_path)
        print(f"Uploaded {local_path} to {remote_path}")
        
    sftp.close()
    
    # Rebuild the backend container
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode('utf-8'))
    print("STDERR:", stderr.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
