import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Write SQL file to VPS host
sftp = client.open_sftp()
with sftp.open('/tmp/fix_otp.sql', 'w') as f:
    f.write("UPDATE settings SET otp_gateway = 'SMS', sas_sms_gateway_url = 'http://sms.sasbulksms.com:3040', sas_sms_api_key = 'e5fb91d8b3275308', sas_sms_sender_id = '8809617633299', sas_sms_secret_key = '' WHERE id = (SELECT id FROM settings LIMIT 1);\n")
sftp.close()

# Pipe the SQL file into the DB container's psql
_, stdout, stderr = client.exec_command("docker exec -i shopio-db psql -U postgres -d shopio < /tmp/fix_otp.sql")
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("DB update out:", out[:300] if out.strip() else "(empty)")
print("DB update err:", err[:300] if err.strip() else "(empty)")

# Verify
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id FROM settings LIMIT 1;\"")
print("DB verify:", stdout.read().decode('utf-8', errors='replace').strip())

# Restart backend
_, stdout, _ = client.exec_command("docker restart shopio-backend")
print("Backend restarted")

client.close()
