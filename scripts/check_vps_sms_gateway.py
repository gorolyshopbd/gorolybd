import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Test the actual SAS SMS API from the VPS directly (outside container)
_, stdout, _ = client.exec_command("curl -s 'http://sms.sasbulksms.com:3040/smsapi?api_key=e5fb91d8b3275308&senderid=8809640911650&number=8801712345678&message=Test'")
print("=== Direct SAS SMS test from VPS ===")
print(stdout.read().decode('utf-8', errors='replace')[:500])

# Try the /send endpoint too
_, stdout, _ = client.exec_command("curl -s 'http://sms.sasbulksms.com:3040/send?api_key=e5fb91d8b3275308&senderid=8809640911650&number=8801712345678&message=Test'")
print("\n=== /send endpoint test ===")
print(stdout.read().decode('utf-8', errors='replace')[:500])

# Check backend logs
_, stdout, _ = client.exec_command("docker logs shopio-backend --tail 50 2>&1 | grep -i -E 'otp|sms' | tail -10")
print("\n=== Backend OTP/SMS logs ===")
print(stdout.read().decode('utf-8', errors='replace'))

client.close()
