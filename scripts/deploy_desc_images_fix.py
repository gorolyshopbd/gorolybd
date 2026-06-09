import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    
    files = [
        ('backend/controllers/productController.js', '/opt/shopio/backend/controllers/productController.js'),
        ('backend/controllers/settingsController.js', '/opt/shopio/backend/controllers/settingsController.js'),
        ('backend/routes/settingsRoutes.js', '/opt/shopio/backend/routes/settingsRoutes.js'),
        ('frontend/src/components/AdminDashboard.js', '/opt/shopio/frontend/src/components/AdminDashboard.js'),
        ('docker-compose.yml', '/opt/shopio/docker-compose.yml'),
    ]
    
    for local_rel, remote_path in files:
        local_path = os.path.join(base, local_rel)
        sftp.put(local_path, remote_path)
        print(f"OK: uploaded {local_rel}")
    
    sftp.close()
    
    print("Rebuilding containers...")
    cmd = 'cd /opt/shopio && docker compose up --build -d backend frontend'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("STDERR:", err[-600:] if len(err) > 600 else err)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
