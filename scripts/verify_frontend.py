import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Verify the AuthModal.js on VPS has the auto-fill fix
    cmd = "grep -n 'res.otp\\|setOtpVal' /opt/shopio/frontend/src/components/AuthModal.js | head -20"
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    print("AuthModal.js fix status:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Also check the deployed (built) frontend inside container
    cmd2 = "grep -r 'setOtpVal' /opt/shopio/frontend/src/components/AuthModal.js"
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=30)
    print("setOtpVal in source:", stdout.read().decode('utf-8', errors='ignore'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
