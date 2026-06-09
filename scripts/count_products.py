import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    cmd = 'docker exec shopio-db psql -U postgres -d shopio -t -c "SELECT count(*) FROM products;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("COUNT:", stdout.read().decode('utf-8').strip())
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
