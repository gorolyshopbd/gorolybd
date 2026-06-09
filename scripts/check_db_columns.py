import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)

# Check for description_images and specification_pdf columns in products table
sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' ORDER BY column_name;"
cmd = f"docker exec shopio-db psql -U postgres -d shopio -c \"{sql}\""
stdin, stdout, stderr = c.exec_command(cmd)
print("Products columns:")
print(stdout.read().decode())
print(stderr.read().decode())

# Check for product_description_images table
sql2 = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='product_description_images');"
cmd2 = f"docker exec shopio-db psql -U postgres -d shopio -c \"{sql2}\""
stdin2, stdout2, stderr2 = c.exec_command(cmd2)
print("product_description_images table exists?")
print(stdout2.read().decode())

c.close()
