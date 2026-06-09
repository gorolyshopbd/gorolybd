import paramiko
import sys

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS to fix schema...")
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=15)
    
    # Run the alter table command directly inside the postgres container
    sql_command = "ALTER TABLE seller_settings ADD COLUMN IF NOT EXISTS category_based_commission BOOLEAN DEFAULT false; ALTER TABLE seller_settings ADD COLUMN IF NOT EXISTS seller_based_commission BOOLEAN DEFAULT false; ALTER TABLE seller_settings ADD COLUMN IF NOT EXISTS message_to_seller_mail BOOLEAN DEFAULT true; ALTER TABLE seller_settings ADD COLUMN IF NOT EXISTS subscription_method VARCHAR DEFAULT 'Adjustable';"
    
    command = f'docker exec shopio-db psql -U postgres -d shopio -c "{sql_command}"'
    
    stdin, stdout, stderr = c.exec_command(command)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    # Also restart the backend container to clear the error state
    print("Restarting backend...")
    c.exec_command('docker restart shopio-backend')
    
    print("Done!")
except Exception as e:
    print(f"Error: {e}")
finally:
    c.close()
