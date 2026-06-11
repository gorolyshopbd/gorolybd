import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
stdin, stdout, stderr = c.exec_command("docker exec shopio-db psql -U postgres -d shopio -c \"\\dt expenses\"")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))
c.close()
