import paramiko
import json

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Update DB to Simulated mode
sql = "UPDATE settings SET otp_gateway = 'Simulated' WHERE id = (SELECT id FROM settings LIMIT 1);"

sftp = client.open_sftp()
with sftp.open('/tmp/fix_otp.sql', 'w') as f:
    f.write(sql + "\n")
sftp.close()

_, stdout, _ = client.exec_command("docker exec -i shopio-db psql -U postgres -d shopio < /tmp/fix_otp.sql")
print("DB updated:", stdout.read().decode('utf-8', errors='replace').strip()[:100])

# Update settings.json
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
settings = json.loads(stdout.read().decode('utf-8'))
settings['otp_gateway'] = 'Simulated'

updated = json.dumps(settings, indent=2, ensure_ascii=False)
with client.open_sftp().open('/tmp/settings_updated.json', 'w') as f:
    f.write(updated)

_, stdout, _ = client.exec_command("docker cp /tmp/settings_updated.json shopio-backend:/app/data/settings.json")
print("settings.json updated")

# Restart
_, stdout, _ = client.exec_command("docker restart shopio-backend")
print("Backend restarted")

# Verify
_, stdout, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway FROM settings LIMIT 1;\"")
print("\nVerify DB:", stdout.read().decode('utf-8', errors='replace').strip())

_, stdout, _ = client.exec_command("docker exec shopio-backend grep otp_gateway /app/data/settings.json")
print("Verify settings.json:", stdout.read().decode('utf-8', errors='replace').strip())

client.close()
print("\nDone! OTP is now in Simulated mode.")
