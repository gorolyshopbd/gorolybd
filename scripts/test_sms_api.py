import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)

    # Get full settings.json keys and values (OTP-related)
    cmd = r"""docker exec shopio-backend node -e "
try {
  const s = require('/app/data/settings.json');
  const keys = Object.keys(s).filter(k => k.toLowerCase().includes('sms') || k.toLowerCase().includes('otp') || k.toLowerCase().includes('gateway'));
  keys.forEach(k => console.log(k + ': ' + s[k]));
} catch(e) { console.log('Error:', e.message); }
" """
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    print("OTP/SMS keys in settings.json:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))

    # Now test the actual SMS API call
    cmd2 = r"""docker exec shopio-backend node -e "
const https = require('https');
const http = require('http');
const url = 'http://sms.sasbulksms.com:3040/smsapi?api_key=e5fb91d8b3275308&senderid=8809617633299&number=8801712345678&message=TestOTP123';
console.log('Calling:', url);
http.get(url, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', d));
}).on('error', e => console.log('Error:', e.message));
" """
    stdin, stdout, stderr = c.exec_command(cmd2, timeout=20)
    print("\nSMS API Test Result:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))

except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
