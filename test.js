// test script
// native fetch
async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shopio.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Login:', loginData.token ? 'Success' : 'Failed');
    
    if (!loginData.token) return;

    // 1. Create template
    const createRes = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const templateData = await createRes.json();
    console.log('Create template status:', createRes.status);
    
    // 2. Update
    if (templateData._id) {
        const updateRes = await fetch(`http://localhost:5000/api/products/${templateData._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
            body: JSON.stringify({
              name: 'Updated Name',
              price: 100,
              category: 'Cat1',
              brand: 'Brand1',
              countInStock: 10,
              description: 'Desc',
              image: '/images/sample.jpg',
              discountPercent: 0,
              isFlashSale: false,
              flashSaleStart: null,
              flashSaleEnd: null,
              metaTitle: '',
              metaDescription: '',
              tags: [],
              youtubeUrl: '',
            })
        });
        const updateData = await updateRes.json();
        console.log('Update Product status:', updateRes.status, updateData);

        const deleteRes = await fetch(`http://localhost:5000/api/products/${templateData._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${loginData.token}` }
        });
        console.log('Delete Product status:', deleteRes.status);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
