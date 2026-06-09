import paramiko
import os

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'
LOCAL_BACKEND = r'C:\Users\user\Desktop\mern stack\backend'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)
sftp = client.open_sftp()

files = [
    'controllers/userController.js',
    'controllers/settingsController.js',
]

# Upload files to VPS temp, then copy into container
for f in files:
    local_path = os.path.join(LOCAL_BACKEND, f)
    remote_tmp = f'/tmp/{os.path.basename(f)}'
    sftp.put(local_path, remote_tmp)
    container_path = f'/app/{f}'
    _, stdout, stderr = client.exec_command(f"docker cp {remote_tmp} shopio-backend:{container_path}")
    err = stderr.read().decode()
    if err:
        print(f"ERROR copying {f}: {err}")
    else:
        print(f"OK {f} deployed")

sftp.close()

# Restart backend
_, stdout, _ = client.exec_command("docker restart shopio-backend")
print("\nBackend restarted")

# Verify the files
for f in files:
    container_path = f'/app/{f}'
    _, stdout, _ = client.exec_command(f"docker exec shopio-backend grep -n 'send?' {container_path}")
    print(f"\n{f}:")
    print(stdout.read().decode('utf-8', errors='replace').strip())

client.close()
