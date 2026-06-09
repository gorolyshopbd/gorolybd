import paramiko
import json
import io

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# 1. Check current settings.json
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
current = stdout.read().decode()
print("=== Current settings.json ===")
settings = json.loads(current)
print(f"otp_gateway: {settings.get('otp_gateway')}")
print(f"sas_sms_api_key: '{settings.get('sas_sms_api_key')}'")
print(f"sas_sms_sender_id: '{settings.get('sas_sms_sender_id')}'")

# 2. Update settings.json via SFTP - copy from container to host, edit, copy back
_, stdout, _ = client.exec_command("docker cp shopio-backend:/app/data/settings.json /tmp/settings.json")
_, stdout, _ = client.exec_command("cat /tmp/settings.json")
current_json = json.loads(stdout.read().decode())

current_json['sas_sms_gateway_url'] = 'http://sms.sasbulksms.com:3040'
current_json['sas_sms_api_key'] = 'e5fb91d8b3275308'
current_json['sas_sms_sender_id'] = '8809617633299'

# Write updated JSON to temp on VPS
updated_str = json.dumps(current_json, indent=2)
_, stdout, _ = client.exec_command(f"cat > /tmp/settings.json << 'JSONEOF'\n{updated_str}\nJSONEOF")

# Copy back into container
_, stdout, stderr = client.exec_command("docker cp /tmp/settings.json shopio-backend:/app/data/settings.json")
print("\n=== Copy to container ===")
print(stdout.read().decode()[:200] if stdout.read().decode() else "")
print(stderr.read().decode()[:200] if stderr.read().decode() else "")

# 3. Update DB
_, stdout, stderr = client.exec_command(
    """docker exec shopio-db psql -U postgres -d shopio -c "
        UPDATE settings SET 
          sas_sms_gateway_url = 'http://sms.sasbulksms.com:3040',
          sas_sms_api_key = 'e5fb91d8b3275308',
          sas_sms_sender_id = '8809617633299',
          otp_gateway = 'SMS'
        WHERE id = (SELECT id FROM settings LIMIT 1);
    " """
)
print("\n=== DB Update ===")
out = stdout.read().decode()
err = stderr.read().decode()
print(out if out else err)

# 4. Restart backend
_, stdout, stderr = client.exec_command("docker restart shopio-backend")
print("\n=== Restart backend ===")
print(stdout.read().decode())
print(stderr.read().decode()[:200])

# 5. Verify
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json | python3 -c \"import sys,json; d=json.load(sys.stdin); print('otp_gateway:', d.get('otp_gateway')); print('api_key:', d.get('sas_sms_api_key')); print('sender_id:', d.get('sas_sms_sender_id')); print('gateway_url:', d.get('sas_sms_gateway_url'))\"")
print("\n=== Verification ===")
print(stdout.read().decode())

client.close()
print("\n✅ OTP settings fixed on VPS!")
