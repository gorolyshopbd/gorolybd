// using native fetch

async function testCheckout() {
  const email = 'test_checkout_' + Date.now() + '@example.com';
  console.log('Registering user...');
  const regRes = await fetch('http://localhost:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  
  if (!regRes.ok) {
    const err = await regRes.text();
    console.error('Registration failed:', err);
    return;
  }
  
  const user = await regRes.json();
  console.log('Registered user. Token length:', user.token.length);
  
  // Get a valid product from DB
  console.log('Fetching products...');
  const prodRes = await fetch('http://localhost:5000/api/products');
  const prodData = await prodRes.json();
  
  if (!prodData.products || prodData.products.length === 0) {
    console.error('No products found in DB!');
    return;
  }
  
  const product = prodData.products[0];
  console.log('Using product:', product._id);
  
  // Add to cart payload
  const payload = {
    orderItems: [{
      product: product._id,
      name: product.name,
      image: product.images ? product.images[0] : '',
      price: product.price,
      qty: 1
    }],
    shippingAddress: { address: '123 Test St', city: 'Test City', postalCode: '12345', phone: '01234567890' },
    paymentMethod: 'Cash on Delivery',
    itemsPrice: product.price,
    shippingPrice: 50,
    discountPrice: 0,
    totalPrice: product.price + 50
  };
  
  console.log('Placing order...');
  const orderRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify(payload)
  });
  
  const orderData = await orderRes.json();
  console.log('Order status:', orderRes.status);
  console.log('Order response:', orderData);
}

testCheckout().catch(console.error);
