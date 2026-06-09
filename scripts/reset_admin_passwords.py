import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Reset password for both admin accounts to known values
    # admin@gorolyshop.com -> admin123
    # admin@shopio.com -> admin123
    reset_cmd = '''docker exec $(docker ps -q -f name=shopio-backend) node -e "
import('./config/db.js').then(async ({db}) => {
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.default.hash('admin123', 10);
  
  const r1 = await db.database.from('users').update({password_hash: hash}).eq('email', 'admin@gorolyshop.com');
  const r2 = await db.database.from('users').update({password_hash: hash}).eq('email', 'admin@shopio.com');
  
  console.log('gorolyshop error:', r1.error ? r1.error.message : 'none');
  console.log('shopio error:', r2.error ? r2.error.message : 'none');
  console.log('Password reset to admin123 for both accounts');
  process.exit(0);
}).catch(e => { console.log('Error:', e.message); process.exit(1); });
" 2>&1'''
    
    stdin, stdout, stderr = c.exec_command(reset_cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    print(out)
    
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
