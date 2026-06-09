import paramiko
from scp import SCPClient

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # 1. Check current OTP settings in DB
    cmd = 'docker exec shopio-db psql -U postgres -d shopio -c "SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id, sas_sms_gateway_url FROM settings LIMIT 1;"'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    print("DB OTP Settings:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 2. Upload fixed userController.js
    with SCPClient(c.get_transport()) as scp:
        scp.put(r'c:\Users\user\Desktop\mern stack\backend\controllers\userController.js',
                '/opt/shopio/backend/controllers/userController.js')
    print("Uploaded userController.js")
    
    # 3. Restart just the backend container (faster than full rebuild)
    cmd2 = 'docker restart shopio-backend && sleep 3 && docker ps'
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=60)
    out = stdout.read().decode('utf-8', errors='ignore')
    print("Restart result:", out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
