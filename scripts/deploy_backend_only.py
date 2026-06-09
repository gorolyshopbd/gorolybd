import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    
    files = [
        ('backend/middleware/authMiddleware.js', '/opt/shopio/backend/middleware/authMiddleware.js'),
        ('backend/routes/userRoutes.js', '/opt/shopio/backend/routes/userRoutes.js'),
    ]
    
    for local_rel, remote_path in files:
        local_path = os.path.join(base, local_rel)
        sftp.put(local_path, remote_path)
        print(f"OK: uploaded {local_rel}")
    
    sftp.close()
    
    # Only restart backend - no rebuild needed for JS files
    print("Restarting backend only...")
    cmd = 'cd /opt/shopio && docker compose restart backend 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace')
    print(out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
