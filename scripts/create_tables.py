import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('2.25.182.96', username='root', password='Asif@v@26@200@', timeout=10)
    
    sql = """
    CREATE TABLE IF NOT EXISTS seller_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        account_details TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS seller_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        product_limit INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        features TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS seller_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        commission_type VARCHAR(20) DEFAULT 'percentage',
        commission_value DECIMAL(10,2) DEFAULT 10.00,
        min_payout_amount DECIMAL(10,2) DEFAULT 500.00,
        enable_subscriptions BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS seller_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID,
        package_id UUID,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        payment_status VARCHAR(20) DEFAULT 'paid',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS rewards_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        points_per_amount DECIMAL(10,2) DEFAULT 1.00,
        min_points_to_redeem INTEGER DEFAULT 100,
        redemption_value DECIMAL(10,2) DEFAULT 1.00,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS rewards_user_points (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        points INTEGER DEFAULT 0,
        total_earned INTEGER DEFAULT 0,
        total_redeemed INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS rewards_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        points INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        description TEXT,
        order_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    cmd = f'''docker exec shopio-db psql -U postgres -d shopio -c "{sql}"'''
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode('utf-8'))
    print("STDERR:", stderr.read().decode('utf-8'))
    
except Exception as e:
    print(f"Error: {e}")
c.close()
