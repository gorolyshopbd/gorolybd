import paramiko
import sys

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    print("Pulling latest code and building Docker...")
    # Add a deploy script to the server
    commands = """
    cd /opt/shopio
    git pull origin master --rebase
    docker compose up -d --build
    """
    stdin, stdout, stderr = c.exec_command(commands)
    
    # Stream output
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    for line in iter(stderr.readline, ""):
        print(line, end="", file=sys.stderr)
        
    exit_status = stdout.channel.recv_exit_status()
    if exit_status == 0:
        print("\nDeployment successful!")
    else:
        print(f"\nDeployment failed with exit code {exit_status}")
        
except Exception as e:
    print(f"Connection failed: {e}")
finally:
    c.close()
