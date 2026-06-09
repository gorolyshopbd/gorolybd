import paramiko

HOST = '2.25.182.96'
USER = 'root'
PASS = 'Asif@v@26@200@'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, look_for_keys=False, allow_agent=False)

cmds = [
    "docker exec shopio-db psql -U postgres -d shopio -c \"SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'settings'::regclass;\"",
    "docker exec shopio-db psql -U postgres -d shopio -c \"SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'otp_gateway';\"",
    "docker exec shopio-db psql -U postgres -d shopio -t -A -c \"SELECT otp_gateway FROM settings;\""]

for cmd in cmds:
    _, stdout, _ = client.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace').strip())
    print("---")

client.close()
