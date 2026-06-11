import paramiko
import os
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf8', buffering=1)
import io

VPS_HOST = '2.25.182.96'
VPS_USER = 'root'
VPS_PASS = 'Asif@v@26@200@'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    stdin, stdout, stderr = c.exec_command('tail -n 100 /tmp/build_frontend.log')
    print("=== frontend log ===")
    print(stdout.read().decode('utf-8', errors='replace'))
    
    stdin, stdout, stderr = c.exec_command('tail -n 100 /tmp/build_backend.log')
    print("=== backend log ===")
    print(stdout.read().decode('utf-8', errors='replace'))

    stdin, stdout, stderr = c.exec_command('tail -n 100 /tmp/up.log')
    print("=== up log ===")
    print(stdout.read().decode('utf-8', errors='replace'))

    stdin, stdout, stderr = c.exec_command('cat /tmp/deploy_status.txt')
    print("=== status ===")
    print(stdout.read().decode('utf-8', errors='replace'))

except Exception as e:
    print(e)
finally:
    c.close()
