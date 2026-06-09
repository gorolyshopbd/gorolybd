import bcrypt from 'bcryptjs';

async function check() {
  const hash = '$2a$10$cHZOvoggX7hVGYM9MbbFwerQLF1PU2NbQQTrt3d/1HmrgscjJLn36';
  const match = await bcrypt.compare('admin123', hash);
  console.log('Does admin123 match hash?', match);
  const hash2 = await bcrypt.hash('admin123', 10);
  console.log('Generated hash for admin123:', hash2);
}
check();
