import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

# Test GET with /send endpoint (current code)
cmd1 = "curl -s 'http://sms.sasbulksms.com:3040/send?api_key=e5fb91d8b3275308&senderid=8809640911650&number=8801712345678&message=Hello'"
# Test POST with form data
cmd2 = "curl -s -X POST 'http://sms.sasbulksms.com:3040/send' -d 'api_key=e5fb91d8b3275308&senderid=8809640911650&number=8801712345678&message=Hello'"
# Test POST with JSON
cmd3 = "curl -s -X POST 'http://sms.sasbulksms.com:3040/send' -H 'Content-Type: application/json' -d '{\"api_key\":\"e5fb91d8b3275308\",\"senderid\":\"8809640911650\",\"number\":\"8801712345678\",\"message\":\"Hello\"}'"
# Test with different parameter names
cmd4 = "curl -s 'http://sms.sasbulksms.com:3040/send?apiKey=e5fb91d8b3275308&senderId=8809640911650&phone=8801712345678&text=Hello'"
# Test without senderid
cmd5 = "curl -s 'http://sms.sasbulksms.com:3040/send?api_key=e5fb91d8b3275308&number=8801712345678&message=Hello'"

for i, cmd in enumerate([cmd1, cmd2, cmd3, cmd4, cmd5], 1):
    _, stdout, _ = client.exec_command(cmd)
    result = stdout.read().decode('utf-8', errors='replace').strip()[:200]
    print(f"Test {i}: {result}")
    print("---")

client.close()
