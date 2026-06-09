import paramiko, json, os, time

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'
LOCAL_BACKEND = r'C:\Users\user\Desktop\mern stack\backend'

API_KEY = 'e5fb91d8b3275308'
SECRET_KEY = 'bed1c287'
SENDER_ID = '8809640911650'
GATEWAY_URL = 'http://sms.sasbulksms.com:3040'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False, timeout=15)
print("Connected to VPS")

# 1. Update DB settings
sql = f"""UPDATE settings SET 
  otp_gateway = 'SAS_BULK_SMS',
  sas_sms_gateway_url = '{GATEWAY_URL}',
  sas_sms_api_key = '{API_KEY}',
  sas_sms_secret_key = '{SECRET_KEY}',
  sas_sms_sender_id = '{SENDER_ID}'
WHERE id = (SELECT id FROM settings LIMIT 1);"""
sftp = client.open_sftp()
with sftp.open('/tmp/fix_otp.sql', 'w') as f:
    f.write(sql + "\n")
sftp.close()
_, stdout, _ = client.exec_command("docker exec -i shopio-db psql -U postgres -d shopio < /tmp/fix_otp.sql")
print("DB updated:", stdout.read().decode()[:100])

# 2. Update settings.json in container
_, stdout, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json")
settings = json.loads(stdout.read().decode('utf-8'))
settings['otp_gateway'] = 'SAS_BULK_SMS'
settings['sas_sms_gateway_url'] = GATEWAY_URL
settings['sas_sms_api_key'] = API_KEY
settings['sas_sms_secret_key'] = SECRET_KEY
settings['sas_sms_sender_id'] = SENDER_ID
updated = json.dumps(settings, indent=2, ensure_ascii=False)
with client.open_sftp().open('/tmp/settings_updated.json', 'w') as f:
    f.write(updated)
_, stdout, _ = client.exec_command("docker cp /tmp/settings_updated.json shopio-backend:/app/data/settings.json")
print("settings.json updated")

# 3. Upload updated controller files
sftp = client.open_sftp()
for f in ['controllers/userController.js', 'controllers/settingsController.js']:
    local_path = os.path.join(LOCAL_BACKEND, f)
    remote_tmp = f'/tmp/{os.path.basename(f)}'
    sftp.put(local_path, remote_tmp)
    container_path = f'/app/{f}'
    _, stdout, _ = client.exec_command(f"docker cp {remote_tmp} shopio-backend:{container_path}")
    print(f"Uploaded {f}")
sftp.close()

# 4. Restart backend
_, stdout, _ = client.exec_command("docker restart shopio-backend")
result = stdout.read().decode()
print(f"Backend restarted: {result.strip()}")
time.sleep(2)

# 5. Verify
_, stdout, _ = client.exec_command("""docker exec shopio-db psql -U postgres -d shopio -t -A -c "SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id, sas_sms_secret_key, sas_sms_gateway_url FROM settings LIMIT 1;" """)
print("\nDB:", stdout.read().decode('utf-8', errors='replace').strip())

_, stdout, _ = client.exec_command("""docker exec shopio-backend node -e "
const s = require('/app/data/settings.json');
console.log('gateway:', s.otp_gateway);
console.log('apikey:', s.sas_sms_api_key);
console.log('secret:', s.sas_sms_secret_key);
console.log('sender:', s.sas_sms_sender_id);
console.log('url:', s.sas_sms_gateway_url);
" """)
print("settings.json:\n" + stdout.read().decode('utf-8', errors='replace').strip())

_, stdout, _ = client.exec_command("""docker exec shopio-backend grep -n 'apikey\\|secretkey\\|callerID\\|toUser\\|messageContent\\|sendtext' /app/controllers/userController.js /app/controllers/settingsController.js""")
print("\nController params:\n" + stdout.read().decode('utf-8', errors='replace').strip())

client.close()
print("\nDone! SMS delivery should now work.")
