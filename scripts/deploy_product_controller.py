import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    local_path = 'backend/controllers/productController.js'
    remote_path = '/opt/shopio/backend/controllers/productController.js'
    
    sftp.put(os.path.join(base, local_path), remote_path)
    print(f"OK: uploaded {local_path}")
    
    sftp.close()
    
    print("Building backend...")
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("STDERR:", err[-300:] if len(err) > 300 else err)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
