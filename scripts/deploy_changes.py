import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Let's find out where the backend and frontend code are located in the VPS
    # We can inspect the running docker containers to get their mount points or working directories.
    cmd = 'docker inspect shopio-backend | grep -A 10 "Mounts"'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    print("Backend Mounts:", out)
    
    cmd2 = 'docker ps'
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=30)
    print("Running containers:", stdout.read().decode('utf-8', errors='replace'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
