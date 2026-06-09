import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    print("=== Fresh backend logs (last 30 lines) ===")
    stdin, stdout, stderr = c.exec_command('docker logs shopio-backend --tail=30 2>&1')
    print(stdout.read().decode('utf-8', errors='replace'))
    
    print("\n=== Container status ===")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose ps')
    print(stdout.read().decode('utf-8', errors='replace'))
    
    print("\n=== Quick API test ===")
    stdin, stdout, stderr = c.exec_command('curl -s https://gorolyshop.com/api/products | head -c 200')
    print(stdout.read().decode('utf-8', errors='replace'))

except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
