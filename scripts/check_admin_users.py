import paramiko
import json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Check if admin user exists in DB
    check_cmd = '''docker exec $(docker ps -q -f name=shopio-backend) node -e "
import('./config/db.js').then(async ({db}) => {
  const {data, error} = await db.database.from('users').select('id,name,email,is_admin,role').eq('is_admin', true);
  console.log(JSON.stringify({data, error: error ? error.message : null}));
  process.exit(0);
}).catch(e => { console.log(JSON.stringify({error: e.message})); process.exit(1); });
" 2>&1'''
    
    stdin, stdout, stderr = c.exec_command(check_cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    print("Admin users check:")
    print(out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
