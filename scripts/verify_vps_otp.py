import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Check settings.json
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json | grep -E 'otp_gateway|sas_sms_api_key|sas_sms_sender_id'")
print("=== settings.json ===")
print(stdout.read().decode('utf-8', errors='replace').strip())

# Check DB
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id FROM settings LIMIT 1;\"")
print("\n=== DB ===")
print(stdout.read().decode('utf-8', errors='replace').strip())

client.close()
