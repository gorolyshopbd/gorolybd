async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/users/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@shopio.com', password: 'admin123' }) // Assuming default admin credentials
    });
    const data = await res.json();
    console.log("Login response:", data);
  } catch(e) {
    console.error(e);
  }
}
testLogin();
