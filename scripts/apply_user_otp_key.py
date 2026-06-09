import paramiko
import json

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

API_KEY = 'e5fb91d8b3275308'
SENDER_ID = '8809640911650'
GATEWAY_URL = 'http://sms.sasbulksms.com:3040'

# Update DB
sql = f"UPDATE settings SET otp_gateway = 'SAS_BULK_SMS', sas_sms_gateway_url = '{GATEWAY_URL}', sas_sms_api_key = '{API_KEY}', sas_sms_sender_id = '{SENDER_ID}', sas_sms_secret_key = '' WHERE id = (SELECT id FROM settings LIMIT 1);"

sftp = client.open_sftp()
with sftp.open('/tmp/fix_otp.sql', 'w') as f:
    f.write(sql + "\n")
sftp.close()

_, stdout, _ = client.exec_command("docker exec -i shopio-db psql -U postgres -d shopio < /tmp/fix_otp.sql")
print("DB updated")

# Update settings.json
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
settings = json.loads(stdout.read().decode('utf-8'))
settings['otp_gateway'] = 'SAS_BULK_SMS'
settings['sas_sms_gateway_url'] = GATEWAY_URL
settings['sas_sms_api_key'] = API_KEY
settings['sas_sms_sender_id'] = SENDER_ID
settings['sas_sms_secret_key'] = ''

updated = json.dumps(settings, indent=2, ensure_ascii=False)
with client.open_sftp().open('/tmp/settings_updated.json', 'w') as f:
    f.write(updated)

_, stdout, _ = client.exec_command("docker cp /tmp/settings_updated.json shopio-backend:/app/data/settings.json")
print("settings.json updated")

# Restart
_, stdout, _ = client.exec_command("docker restart shopio-backend")
print("Backend restarted")

# Verify
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id FROM settings LIMIT 1;\"")
print("\nVerify DB:", stdout.read().decode('utf-8', errors='replace').strip())

_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json | grep -E 'otp_gateway|sas_sms_api_key|sas_sms_sender_id'")
print("Verify settings.json:\n" + stdout.read().decode('utf-8', errors='replace').strip())

client.close()
