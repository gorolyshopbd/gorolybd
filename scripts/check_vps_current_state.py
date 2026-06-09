import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Check current OTP settings
_, out, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway FROM settings LIMIT 1;\"")
print("DB otp_gateway:", out.read().decode().strip())

_, out, _ = client.exec_command("docker exec shopio-backend grep otp_gateway /app/data/settings.json")
print("settings.json:", out.read().decode().strip())

# Check if backend is running
_, out, _ = client.exec_command("docker ps --filter name=shopio-backend --format '{{.Status}}'")
print("Backend:", out.read().decode().strip())

# Check backend logs for recent OTP attempts
_, out, _ = client.exec_command("docker logs shopio-backend --tail 100 2>&1 | grep -i -E 'otp|simulated' | tail -10")
logs = out.read().decode().strip()
print("\nRecent OTP logs:")
print(logs if logs else "(no OTP logs)")

client.close()
