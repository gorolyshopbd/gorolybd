const http = require('http');

// Test 1: Admin login
const data = JSON.stringify({username:'admin@shopio.com', password:'admin123'});
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/admin-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('LOGIN:', res.statusCode);
    const parsed = JSON.parse(body);
    if (parsed.token) {
      // Test 2: Protected endpoint
      const opts = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/profile',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + parsed.token }
      };
      const req2 = http.request(opts, res2 => {
        let b2 = '';
        res2.on('data', c => b2 += c);
        res2.on('end', () => console.log('PROFILE:', res2.statusCode, b2));
      });
      req2.end();
    }
  });
});
req.write(data);
req.end();
