import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    print("Checking backend logs...")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose logs --tail=50 backend')
    print(stdout.read().decode('utf-8'))
    
    print("\nChecking frontend logs...")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose logs --tail=50 frontend')
    print(stdout.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
