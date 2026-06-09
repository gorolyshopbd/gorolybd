import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@')

# Check productController for DEMO_PRODUCTS
stdin, stdout, stderr = c.exec_command(
    'grep -c "DEMO_PRODUCTS" /opt/shopio/backend/controllers/productController.js'
)
demo_count = stdout.read().decode('utf-8', errors='replace').strip()
print(f"DEMO_PRODUCTS occurrences in productController: {demo_count}")

# Check back button area in AdminDashboard
stdin2, stdout2, stderr2 = c.exec_command(
    'sed -n "4935,4950p" /opt/shopio/frontend/src/components/AdminDashboard.js | cat -v'
)
btn_code = stdout2.read().decode('utf-8', errors='replace')
print(f"Back button code:\n{btn_code}")

# Check file timestamps
stdin3, stdout3, stderr3 = c.exec_command(
    'stat -c "%y %n" /opt/shopio/frontend/src/components/AdminDashboard.js /opt/shopio/backend/controllers/productController.js'
)
print("File timestamps:\n" + stdout3.read().decode('utf-8', errors='replace'))

c.close()
