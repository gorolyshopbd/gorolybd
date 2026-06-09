import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)

# Create product_description_images table
sql = """
CREATE TABLE IF NOT EXISTS product_description_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_desc_images_product_id ON product_description_images(product_id);
"""

cmd = f"docker exec shopio-db psql -U postgres -d shopio -c \"{sql}\""
stdin, stdout, stderr = c.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
print("STDOUT:", out)
print("STDERR:", err)
c.close()
