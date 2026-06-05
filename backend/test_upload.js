import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testUpload() {
  try {
    // We need to login to get a token first
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: '123' }) 
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.log('Login failed:', loginData);
      return;
    }

    const form = new FormData();
    // create a dummy file
    fs.writeFileSync('dummy.jpg', 'dummy content');
    form.append('image', fs.createReadStream('dummy.jpg'));

    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginData.token}`
      },
      body: form
    });
    
    const data = await res.json();
    console.log('Upload response:', res.status, data);
  } catch (e) {
    console.error(e);
  }
}

testUpload();
