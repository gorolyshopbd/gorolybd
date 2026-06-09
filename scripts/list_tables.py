import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    
    cmd = '''docker exec shopio-db psql -U postgres -d shopio -c "\\dt"'''
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
c.close()
