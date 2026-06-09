import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Find the postgres credentials from docker-compose.yml
    cmd = "cat /opt/shopio/docker-compose.yml | grep -A 20 postgres"
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    print("Postgres config:", stdout.read().decode('utf-8', errors='ignore'))

    # Try to find the postgres credentials
    cmd2 = "docker exec shopio-db env | grep POSTGRES"
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=30)
    print("Postgres env:", stdout.read().decode('utf-8', errors='ignore'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
