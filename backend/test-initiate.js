import fetch from 'node-fetch'; // Wait, node 18+ has global fetch

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/rupantorpay/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: '123',
        amount: 100
      })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
