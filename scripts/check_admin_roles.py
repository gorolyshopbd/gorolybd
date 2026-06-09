import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    cmd = '''docker exec $(docker ps -q -f name=shopio-backend) node -e "
import('./config/db.js').then(async ({db}) => {
  const r2 = await db.database.from('users').select('email, is_admin, role').eq('email', 'admin@shopio.com').single();
  console.log(r2.data);
  process.exit(0);
}).catch(e => { console.log('Error:', e.message); process.exit(1); });
" 2>&1'''
    
    stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    print(out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
