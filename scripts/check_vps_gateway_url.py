import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

_, out, _ = client.exec_command("docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT sas_sms_gateway_url, sas_sms_api_key, sas_sms_sender_id, otp_gateway FROM settings LIMIT 1;\"")
print("DB:", out.read().decode('utf-8', errors='replace').strip())

_, out, _ = client.exec_command("docker exec shopio-backend cat /app/data/settings.json | python3 -c \"import sys,json; d=json.load(sys.stdin); print('settings: gateway_url=%s, api_key=%s, sender=%s, otp_gateway=%s' % (d.get('sas_sms_gateway_url',''), d.get('sas_sms_api_key','')[:10], d.get('sas_sms_sender_id',''), d.get('otp_gateway','')))\"")
result = out.read().decode('utf-8', errors='replace').strip()
if "OCI runtime" in result:
    _, out, _ = client.exec_command("docker exec shopio-backend grep -E 'sas_sms_gateway_url|sas_sms_api_key|sas_sms_sender_id|otp_gateway' /app/data/settings.json")
    print("settings.json:\n" + out.read().decode('utf-8', errors='replace').strip())
else:
    print(result)

client.close()
