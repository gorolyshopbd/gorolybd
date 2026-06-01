import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function test() {
  try {
    // Login
    const loginRes = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shopio.com', password: 'admin123' })
    });
    const adminUser = await loginRes.json();
    console.log('Login result:', adminUser);
    
    if (!adminUser || !adminUser.token) {
      console.error('Failed to log in');
      return;
    }
    
    const testImageUrl = 'https://z6zhffa4.ap-southeast.insforge.app/api/storage/buckets/product/objects/products%2F1780138713191-swfsh7.jpg';
    
    // Create new category
    console.log('Creating category via API...');
    const createRes = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser.token}`
      },
      body: JSON.stringify({
        name: 'Test Category ' + Date.now(),
        image: testImageUrl,
        order: 1
      })
    });
    console.log('API Create status:', createRes.status);
    console.log('API Create body:', await createRes.json());
    
  } catch (err) {
    console.error('API test error:', err);
  }
}

test();
