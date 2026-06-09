import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Check if anything is listening on port 3040 on VPS
_, out, _ = client.exec_command("ss -tlnp | grep 3040 || netstat -tlnp 2>/dev/null | grep 3040 || echo 'Nothing on 3040'")
print("Port 3040 on VPS:")
print(out.read().decode())

# Check if docker container exposes port 3040
_, out, _ = client.exec_command("docker ps --format '{{.Names}} {{.Ports}}'")
print("\nDocker ports:")
print(out.read().decode())

# Check if sms.sasbulksms.com resolves and port 3040 is reachable from VPS
_, out, _ = client.exec_command("timeout 5 bash -c 'echo > /dev/tcp/sms.sasbulksms.com/3040 && echo PORT 3040 OPEN || echo PORT 3040 CLOSED' 2>&1")
print("\nSAS SMS port 3040 from VPS:")
print(out.read().decode())

client.close()
