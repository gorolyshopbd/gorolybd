import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('2.25.182.96', username='root', password='Asif@v@26@200@', look_for_keys=False, allow_agent=False)

for f in ['/app/controllers/userController.js', '/app/controllers/settingsController.js']:
    _, out, _ = client.exec_command(f"docker exec shopio-backend grep -n 'sendtext\\|smsapi' {f}")
    result = out.read().decode().strip()
    if result:
        print(f'{f}: {result}')
    else:
        print(f'{f}: no sendtext/smsapi found (using different endpoint)')
        _, out2, _ = client.exec_command(f"docker exec shopio-backend grep -n 'baseUrl' {f}")
        print(out2.read().decode().strip())

client.close()
