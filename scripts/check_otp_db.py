import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Check full DB settings - just OTP related fields
    cmd = """docker exec shopio-db psql -U postgres -d shopio -t -c "SELECT otp_gateway, sas_sms_api_key, sas_sms_sender_id, sas_sms_gateway_url, sas_sms_secret_key, custom_sms_api_url FROM settings LIMIT 1;" """
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    print("OTP Settings in DB:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check if settings.json has any SMS config (avoid unicode issue)
    cmd2 = r"""docker exec shopio-backend node -e "try{const s=require('/app/data/settings.json'); console.log('gateway:', s.otpGateway||s.otp_gateway||'N/A'); console.log('apikey:', s.sasSmsApiKey||s.sas_sms_api_key||'N/A'); console.log('senderid:', s.sasSmsApiKey||s.sas_sms_sender_id||'N/A');}catch(e){console.log('no settings.json');}" """
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=15)
    print("\nSettings.json (from container):")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
