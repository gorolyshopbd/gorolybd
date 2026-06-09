import paramiko
import sys

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Run what the user asked: "deploy"
    # Or maybe it's "cd /opt/shopio && ./deploy"
    commands = """
    cd /opt/shopio
    git pull origin master --rebase
    docker compose up -d --build
    """
    
    # Wait, the user specifically typed `ssh root@2.25.182.96 deploy`.
    # Let's see if there's an executable `deploy` in PATH, or run standard deploy
    stdin, stdout, stderr = c.exec_command('which deploy')
    deploy_path = stdout.read().decode().strip()
    
    if deploy_path:
        print(f"Found deploy script at {deploy_path}. Running it...")
        stdin, stdout, stderr = c.exec_command(deploy_path)
    else:
        print("No 'deploy' command found in PATH. Running standard git pull & docker compose build instead...")
        stdin, stdout, stderr = c.exec_command(commands)
    
    # Stream output
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    for line in iter(stderr.readline, ""):
        print(line, end="", file=sys.stderr)
        
    exit_status = stdout.channel.recv_exit_status()
    print(f"\nFinished with exit code {exit_status}")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
