import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    
    sql = "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;"
    
    cmd = f'''docker exec shopio-db psql -U postgres -d shopio -c "{sql}"'''
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    
    if out: print("STDOUT:", out.strip())
    if err: print("STDERR:", err.strip())
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
