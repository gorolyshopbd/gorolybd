import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Write correct SQL - use SAS_BULK_SMS (allowed by check constraint)
sftp = client.open_sftp()
with sftp.open('/tmp/fix_otp.sql', 'w') as f:
    f.write("UPDATE settings SET otp_gateway = 'SAS_BULK_SMS', sas_sms_gateway_url = 'http://sms.sasbulksms.com:3040', sas_sms_api_key = 'e5fb91d8b3275308', sas_sms_sender_id = '8809617633299', sas_sms_secret_key = '' WHERE id = (SELECT id FROM settings LIMIT 1);\n")
sftp.close()

_, stdout, stderr = client.exec_command("docker exec -i shopio-db psql -U postgres -d shopio < /tmp/fix_otp.sql")
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("DB update out:", out[:300] if out.strip() else "(empty)")
print("DB update err:", err[:300] if err.strip() else "(empty)")

# Verify
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id FROM settings LIMIT 1;\"")
print("\nDB verify:", stdout.read().decode('utf-8', errors='replace').strip())

# Also update settings.json to match
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
import json as j
settings = j.loads(stdout.read().decode('utf-8'))
settings['otp_gateway'] = 'SAS_BULK_SMS'
settings['sas_sms_gateway_url'] = 'http://sms.sasbulksms.com:3040'
settings['sas_sms_api_key'] = 'e5fb91d8b3275308'
settings['sas_sms_sender_id'] = '8809617633299'

updated = j.dumps(settings, indent=2, ensure_ascii=False)
sftp2 = client.open_sftp()
with sftp2.open('/tmp/settings_updated.json', 'w') as f:
    f.write(updated)
sftp2.close()

_, stdout, _ = client.exec_command("docker cp /tmp/settings_updated.json shopio-backend:/app/data/settings.json")
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json | python3 -c \"import sys,json as j; d=j.load(sys.stdin); print('otp_gateway:', d['otp_gateway'], '| api_key:', d['sas_sms_api_key'][:10]+'...', '| sender:', d['sas_sms_sender_id'])\"")
print("\nsettings.json verify:", stdout.read().decode('utf-8', errors='replace').strip())

# Restart backend
_, stdout, _ = client.exec_command("docker restart shopio-backend")
print("\nBackend restarted!")

client.close()
