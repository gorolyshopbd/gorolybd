import paramiko
import os
import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

VPS_HOST = '2.25.182.96'
VPS_USER = 'root'
VPS_PASS = 'Asif@v@26@200@'
REMOTE_BASE = '/opt/shopio'
LOCAL_BASE = r'c:\Users\user\Desktop\mern stack'

files_to_upload = [
    ('frontend/src/components/SmartDashboardView.js',       REMOTE_BASE + '/frontend/src/components/SmartDashboardView.js'),
    ('frontend/src/components/FinanceSystemView.js',        REMOTE_BASE + '/frontend/src/components/FinanceSystemView.js'),
    ('frontend/src/components/InventoryManagementView.js',  REMOTE_BASE + '/frontend/src/components/InventoryManagementView.js'),
    ('frontend/src/components/MarketingRoiView.js',         REMOTE_BASE + '/frontend/src/components/MarketingRoiView.js'),
    ('frontend/src/components/DashboardOrders.js',          REMOTE_BASE + '/frontend/src/components/DashboardOrders.js'),
    ('frontend/src/components/UserDashboard.js',            REMOTE_BASE + '/frontend/src/components/UserDashboard.js'),
    ('frontend/src/components/AdminDashboard.js',           REMOTE_BASE + '/frontend/src/components/AdminDashboard.js'),
    ('backend/controllers/inventoryController.js',          REMOTE_BASE + '/backend/controllers/inventoryController.js'),
    ('backend/controllers/financeController.js',            REMOTE_BASE + '/backend/controllers/financeController.js'),
    ('backend/controllers/marketingController.js',          REMOTE_BASE + '/backend/controllers/marketingController.js'),
    ('backend/controllers/categoryController.js',           REMOTE_BASE + '/backend/controllers/categoryController.js'),
    ('backend/controllers/fraudController.js',              REMOTE_BASE + '/backend/controllers/fraudController.js'),
    ('backend/controllers/expenseController.js',            REMOTE_BASE + '/backend/controllers/expenseController.js'),
    ('backend/routes/inventoryRoutes.js',                   REMOTE_BASE + '/backend/routes/inventoryRoutes.js'),
    ('backend/routes/financeRoutes.js',                     REMOTE_BASE + '/backend/routes/financeRoutes.js'),
    ('backend/routes/marketingRoutes.js',                   REMOTE_BASE + '/backend/routes/marketingRoutes.js'),
    ('backend/routes/fraudRoutes.js',                       REMOTE_BASE + '/backend/routes/fraudRoutes.js'),
    ('backend/routes/expenseRoutes.js',                     REMOTE_BASE + '/backend/routes/expenseRoutes.js'),
    ('backend/routes/orderRoutes.js',                       REMOTE_BASE + '/backend/routes/orderRoutes.js'),
    ('backend/config/db.js',                                REMOTE_BASE + '/backend/config/db.js'),
    ('backend/server.js',                                   REMOTE_BASE + '/backend/server.js'),
    ('backend/controllers/orderController.js',              REMOTE_BASE + '/backend/controllers/orderController.js'),
    ('frontend/src/app/page.js',                            REMOTE_BASE + '/frontend/src/app/page.js'),
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    c.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    sftp = c.open_sftp()

    # Step 1: Upload files
    print("Uploading " + str(len(files_to_upload)) + " updated files to VPS...")
    for local_rel, remote_path in files_to_upload:
        local_path = os.path.join(LOCAL_BASE, local_rel)
        if os.path.exists(local_path):
            sftp.put(local_path, remote_path)
            print("  UPLOADED: " + local_rel)
        else:
            print("  MISSING:  " + local_rel)

    sftp.close()
    print("\nAll files uploaded!")

    # Step 2: Run full rebuild on VPS in background, log to file
    print("\nStarting Docker rebuild on VPS (this runs on the server, no streaming)...")
    build_cmd = (
        "cd /opt/shopio && "
        "docker compose build --no-cache frontend > /tmp/build_frontend.log 2>&1 && "
        "docker compose build --no-cache backend  > /tmp/build_backend.log  2>&1 && "
        "docker compose up -d > /tmp/up.log 2>&1 && "
        "echo DONE > /tmp/deploy_status.txt || echo FAILED > /tmp/deploy_status.txt"
    )
    # Run in background using nohup so it doesn't die when SSH disconnects
    c.exec_command("nohup bash -c '" + build_cmd.replace("'", "'\\''") + "' > /tmp/deploy_main.log 2>&1 &")
    print("Build started on VPS in background!")
    print("Waiting 90 seconds for frontend build to complete...")

    # Wait and poll every 15 seconds
    for i in range(6):
        time.sleep(15)
        stdin, stdout, stderr = c.exec_command('cat /tmp/deploy_status.txt 2>/dev/null || echo BUILDING')
        status = stdout.read().decode().strip()
        stdin2, stdout2, stderr2 = c.exec_command('tail -5 /tmp/build_frontend.log 2>/dev/null')
        last_log = stdout2.read().decode('utf-8', errors='replace').strip()
        print(f"\n[{(i+1)*15}s] Status: {status}")
        if last_log:
            print("  Last log: " + last_log[-200:])
        if status == 'DONE' or status == 'FAILED':
            break

    # Final check
    stdin, stdout, stderr = c.exec_command('cd /opt/shopio && docker compose ps 2>&1')
    print("\n--- Container Status ---")
    print(stdout.read().decode('utf-8', errors='replace'))

    stdin, stdout, stderr = c.exec_command('docker logs shopio-backend --tail=5 2>&1')
    print("--- Backend Logs ---")
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nDEPLOYMENT COMPLETE - https://gorolyshop.com")

except Exception as e:
    print("\nError: " + str(e))
    import traceback
    traceback.print_exc()
finally:
    c.close()
