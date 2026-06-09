import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    sftp = c.open_sftp()
    
    new_env = (
        "NEXT_PUBLIC_API_BASE_URL=https://gorolyshop.com\n"
        "NEXT_PUBLIC_API_KEY=ik_e2f70bf5adc92ce6720b07120514399a\n"
        "NEXT_PUBLIC_INSFORGE_URL=https://z6zhffa4.ap-southeast.insforge.app\n"
        "NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzcyMjh9.J0pgpMzyXmtwsXlvYx2LA-1_76b5maqA8d7FkfQjm2c\n"
        "NEXT_PUBLIC_API_URL=https://gorolyshop.com/api\n"
    )
    
    with sftp.open('/opt/shopio/frontend/.env.local', 'w') as f:
        f.write(new_env)
    
    print("Updated .env.local")
    
    # Verify
    with sftp.open('/opt/shopio/frontend/.env.local', 'r') as f:
        print(f.read().decode())
    
    sftp.close()
    
    # Rebuild frontend only
    print("Rebuilding frontend with correct API URL...")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose up --build -d frontend 2>&1', timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    # Show last 1000 chars
    print(out[-1000:] if len(out) > 1000 else out)

except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
