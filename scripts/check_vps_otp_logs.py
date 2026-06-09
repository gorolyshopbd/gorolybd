import paramiko
import json

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Check settings in container
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
settings = json.loads(stdout.read().decode())
print("=== Container settings.json ===")
print(f"otp_gateway: {settings.get('otp_gateway')}")
print(f"sas_sms_api_key: {settings.get('sas_sms_api_key')}")
print(f"sas_sms_sender_id: {settings.get('sas_sms_sender_id')}")
print(f"sas_sms_gateway_url: {settings.get('sas_sms_gateway_url')}")

# Check DB settings
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway FROM settings LIMIT 1;\"")
db_gateway = stdout.read().decode().strip()
print(f"\nDB otp_gateway: {db_gateway}")

_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT sas_sms_api_key FROM settings LIMIT 1;\"")
print(f"DB sas_sms_api_key: {stdout.read().decode().strip()}")

_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT sas_sms_sender_id FROM settings LIMIT 1;\"")
print(f"DB sas_sms_sender_id: {stdout.read().decode().strip()}")

# Check backend logs for OTP errors
_, stdout, _ = client.exec_command("docker logs shopio-backend --tail 200 2>&1 | grep -i -E 'otp|sms|error|fail' | tail -30")
print("\n=== Backend OTP/SMS/Error Logs ===")
logs = stdout.read().decode()
print(logs if logs else "(no OTP-related logs found)")

# Check if containers are running
_, stdout, _ = client.exec_command("docker ps --format '{{.Names}} {{.Status}}'")
print("\n=== Container Status ===")
print(stdout.read().decode())

client.close()
