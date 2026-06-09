import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Check current OTP settings in database
    cmd = """docker exec shopio-db psql -U shopio -d shopiodb -c "SELECT otp_gateway, otp_length, otp_expiry, sas_sms_api_key, sas_sms_sender_id, sas_sms_gateway_url FROM settings LIMIT 1;" """
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    print("DB Settings:", stdout.read().decode('utf-8', errors='ignore'))
    print("ERR:", stderr.read().decode('utf-8', errors='ignore'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
