import paramiko
import json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Test the OTP send endpoint directly inside the backend container
    cmd = """docker exec shopio-backend node -e "
const http = require('http');
const body = JSON.stringify({ type: 'phone', target: '01712345678', method: 'sms' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/otp/send',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\\nBODY:', data));
});
req.on('error', e => console.error('ERROR:', e));
req.write(body);
req.end();
" """
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    print(stdout.read().decode('utf-8', errors='ignore'))
    print("ERR:", stderr.read().decode('utf-8', errors='ignore'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
