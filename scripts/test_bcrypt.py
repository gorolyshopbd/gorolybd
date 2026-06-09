import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)

    # Write a small test script to the container
    script = """
const bcrypt = require('bcryptjs');
const hash = '$2a$10$0.qjkHeU.IBX/xIGD1xhReljk.RmFInoxKvrTivcMygNMw9HXM7GS';
async function test() {
  const r1 = await bcrypt.compare('Admin@123', hash);
  const r2 = await bcrypt.compare('password', hash);
  const r3 = await bcrypt.compare('admin123', hash);
  console.log('Admin@123:', r1, '| password:', r2, '| admin123:', r3);
}
test();
"""
    
    sftp = c.open_sftp()
    with sftp.open('/tmp/test_bcrypt.cjs', 'w') as f:
        f.write(script)
    sftp.close()

    # Copy to container and run
    cmd = 'docker cp /tmp/test_bcrypt.cjs $(docker ps -q -f name=shopio-backend):/tmp/test_bcrypt.cjs && docker exec $(docker ps -q -f name=shopio-backend) node /tmp/test_bcrypt.cjs 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    print("Result:", out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
