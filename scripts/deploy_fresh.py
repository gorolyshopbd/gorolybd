import paramiko
import os
import sys

VPS_HOST = '2.25.182.96'
VPS_USER = 'root'
VPS_PASS = 'Asif@v@26@200@'
REMOTE_BASE = '/opt/shopio'
LOCAL_BASE = r'c:\Users\user\Desktop\mern stack'

files_to_upload = [
    ('frontend/src/components/SmartDashboardView.js', REMOTE_BASE + '/frontend/src/components/SmartDashboardView.js'),
    ('frontend/src/components/FinanceSystemView.js', REMOTE_BASE + '/frontend/src/components/FinanceSystemView.js'),
    ('frontend/src/components/InventoryManagementView.js', REMOTE_BASE + '/frontend/src/components/InventoryManagementView.js'),
    ('frontend/src/components/MarketingRoiView.js', REMOTE_BASE + '/frontend/src/components/MarketingRoiView.js'),
    ('frontend/src/components/DashboardOrders.js', REMOTE_BASE + '/frontend/src/components/DashboardOrders.js'),
    ('frontend/src/components/AdminDashboard.js', REMOTE_BASE + '/frontend/src/components/AdminDashboard.js'),
    ('backend/controllers/inventoryController.js', REMOTE_BASE + '/backend/controllers/inventoryController.js'),
    ('backend/controllers/financeController.js', REMOTE_BASE + '/backend/controllers/financeController.js'),
    ('backend/controllers/marketingController.js', REMOTE_BASE + '/backend/controllers/marketingController.js'),
    ('backend/controllers/fraudController.js', REMOTE_BASE + '/backend/controllers/fraudController.js'),
    ('backend/controllers/expenseController.js', REMOTE_BASE + '/backend/controllers/expenseController.js'),
    ('backend/routes/inventoryRoutes.js', REMOTE_BASE + '/backend/routes/inventoryRoutes.js'),
    ('backend/routes/financeRoutes.js', REMOTE_BASE + '/backend/routes/financeRoutes.js'),
    ('backend/routes/marketingRoutes.js', REMOTE_BASE + '/backend/routes/marketingRoutes.js'),
    ('backend/routes/fraudRoutes.js', REMOTE_BASE + '/backend/routes/fraudRoutes.js'),
    ('backend/routes/expenseRoutes.js', REMOTE_BASE + '/backend/routes/expenseRoutes.js'),
    ('backend/routes/orderRoutes.js', REMOTE_BASE + '/backend/routes/orderRoutes.js'),
    ('backend/config/db.js', REMOTE_BASE + '/backend/config/db.js'),
    ('backend/server.js', REMOTE_BASE + '/backend/server.js'),
    ('backend/controllers/orderController.js', REMOTE_BASE + '/backend/controllers/orderController.js'),
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    c.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    sftp = c.open_sftp()

    print("\nUploading " + str(len(files_to_upload)) + " files...\n")
    for local_rel, remote_path in files_to_upload:
        local_path = os.path.join(LOCAL_BASE, local_rel)
        if os.path.exists(local_path):
            remote_dir = os.path.dirname(remote_path)
            c.exec_command('mkdir -p ' + remote_dir)
            import time; time.sleep(0.1)
            sftp.put(local_path, remote_path)
            print("  OK: " + local_rel)
        else:
            print("  MISSING: " + local_rel)

    sftp.close()

    print("\nRebuilding frontend with no-cache (takes 2-4 mins)...")
    stdin, stdout, stderr = c.exec_command(
        'cd /opt/shopio && docker compose build --no-cache frontend 2>&1',
        get_pty=True
    )
    for line in iter(stdout.readline, ""):
        sys.stdout.write(line)
        sys.stdout.flush()

    print("\nRebuilding backend with no-cache...")
    stdin, stdout, stderr = c.exec_command(
        'cd /opt/shopio && docker compose build --no-cache backend 2>&1',
        get_pty=True
    )
    for line in iter(stdout.readline, ""):
        sys.stdout.write(line)
        sys.stdout.flush()

    print("\nRestarting all services...")
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose up -d 2>&1')
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nDEPLOYMENT COMPLETE!")
    print("Live at: https://gorolyshop.com")

except Exception as e:
    print("\nError: " + str(e))
    import traceback
    traceback.print_exc()
finally:
    c.close()
