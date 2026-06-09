import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)

# Check containers
_, out, _ = c.exec_command('docker ps --filter name=shopio --format "table {{.Names}}\t{{.Status}}"')
print("=== Containers ===")
print(out.read().decode())

# Verify code params inside container
_, out, _ = c.exec_command("""docker exec shopio-backend grep -n "apikey\\|secretkey\\|callerID\\|toUser\\|messageContent" /app/controllers/userController.js | head -10""")
print("\n=== userController params ===")
print(out.read().decode())

_, out, _ = c.exec_command("""docker exec shopio-backend grep -n "apikey\\|secretkey\\|callerID\\|toUser\\|messageContent\\|sendtext" /app/controllers/settingsController.js | head -10""")
print("\n=== settingsController params ===")
print(out.read().decode())

# Check settings.json inside container
_, out, _ = c.exec_command("""docker exec shopio-backend node -e "var s=require('/app/data/settings.json'); console.log('gateway:'+s.otp_gateway+' key:'+s.sas_sms_api_key+' secret:'+s.sas_sms_secret_key+' sender:'+s.sas_sms_sender_id+' url:'+s.sas_sms_gateway_url)" """)
print("\n=== settings.json ===")
print(out.read().decode())

# Send test SMS from inside container (uses node-fetch)
_, out, _ = c.exec_command("""docker exec shopio-backend node -e "var f=require('node-fetch'); var p=new URLSearchParams({apikey:'e5fb91d8b3275308',secretkey:'bed1c287',callerID:'8809640911650',toUser:'8801712345678',messageContent:'Test OTP: 123456'}); f('http://sms.sasbulksms.com:3040/sendtext?'+p.toString()).then(function(r){return r.text()}).then(function(t){console.log(t)}).catch(function(e){console.error(e.message)})" """)
print("\n=== Container SMS test ===")
print(out.read().decode())

c.close()
print("\nDone!")
