import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Check env files for SMS credentials
    cmd = "cat /opt/shopio/backend/.env 2>/dev/null || echo 'No .env'"
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    print("Backend .env:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check data/settings.json
    cmd2 = "cat /opt/shopio/backend/data/settings.json 2>/dev/null || echo 'No settings.json'"
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=15)
    print("\nSettings JSON:")
    print(stdout.read().decode('utf-8', errors='ignore'))

    # Check full DB settings row
    cmd3 = "docker exec shopio-db psql -U postgres -d shopio -t -c \"SELECT row_to_json(s) FROM settings s LIMIT 1;\""
    stdin, stdout, stderr = c.exec_command(cmd3, timeout=15)
    print("\nFull DB settings:")
    print(stdout.read().decode('utf-8', errors='ignore'))

except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
