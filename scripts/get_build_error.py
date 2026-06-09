import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Get the actual build error - use a longer output
    cmd = '''cd /opt/shopio && docker compose build frontend 2>&1 | grep -A 30 "ERROR\\|error\\|SyntaxError\\|Failed" | head -60'''
    stdin, stdout, stderr = c.exec_command(cmd, timeout=180)
    out = stdout.read().decode('utf-8', errors='replace')
    print("BUILD OUTPUT:")
    print(out[:3000])
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
