import paramiko
import os

files_to_upload = [
    ('backend/config/db.js', '/opt/shopio/backend/config/db.js'),
    ('backend/controllers/settingsController.js', '/opt/shopio/backend/controllers/settingsController.js'),
    ('backend/controllers/rewardController.js', '/opt/shopio/backend/controllers/rewardController.js'),
    ('backend/controllers/sellerSubscriptionController.js', '/opt/shopio/backend/controllers/sellerSubscriptionController.js'),
    ('backend/controllers/sellerSettingsController.js', '/opt/shopio/backend/controllers/sellerSettingsController.js'),
    ('backend/controllers/categoryController.js', '/opt/shopio/backend/controllers/categoryController.js'),
    ('backend/controllers/payoutController.js', '/opt/shopio/backend/controllers/payoutController.js'),
    ('backend/routes/videoRoutes.js', '/opt/shopio/backend/routes/videoRoutes.js'),
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    base = r'c:\Users\user\Desktop\mern stack'
    for local_path, remote_path in files_to_upload:
        sftp.put(os.path.join(base, local_path), remote_path)
        print(f"OK: {local_path}")
        
    sftp.close()
    
    print("Building backend...")
    cmd = 'cd /opt/shopio && docker compose up --build -d backend'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=180)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("STDERR:", err[-500:] if len(err) > 500 else err)
    
    print("\nVerifying API...")
    import time
    time.sleep(3)
    cmd2 = 'curl -s https://gorolyshop.com/api/products | head -c 200'
    stdin, stdout, stderr = c.exec_command(cmd2)
    print("API:", stdout.read().decode('utf-8', errors='replace'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
