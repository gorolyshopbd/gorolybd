-- Fix admin password hash for admin@shopio.com
-- Password: admin123
-- Run this directly on your PostgreSQL database

UPDATE users 
SET password_hash = '$2a$10$cHZOvoggX7hVGYM9MbbFwerQLF1PU2NbQQTrt3d/1HmrgscjJLn36'
WHERE email = 'admin@shopio.com';

-- If the admin user doesn't exist, create it
INSERT INTO users (name, email, password_hash, is_admin, role, permissions)
SELECT 'Admin', 'admin@shopio.com', '$2a$10$cHZOvoggX7hVGYM9MbbFwerQLF1PU2NbQQTrt3d/1HmrgscjJLn36', true, 'superadmin', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','users']
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@shopio.com');
