const BASE_URL = 'http://localhost:8000/api/v1';

async function run() {
  const timestamp = Date.now();
  const email = `test_customer_${timestamp}@example.com`;
  const password = 'password123';
  const name = 'Test Customer';

  console.log('1. Registering user...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role: 'customer' }),
  });
  if (!regRes.ok) {
    throw new Error(`Registration failed: ${await regRes.text()}`);
  }
  const regData = await regRes.json();
  console.log('Registered User:', regData.user.email);

  console.log('\n2. Logging in...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log('Logged in successfully. Token obtained.');

  console.log('\n3. Fetching products...');
  const prodRes = await fetch(`${BASE_URL}/products`);
  if (!prodRes.ok) {
    throw new Error(`Fetch products failed: ${await prodRes.text()}`);
  }
  const prodData = await prodRes.json();
  if (!prodData.docs || prodData.docs.length === 0) {
    throw new Error('No products found in DB');
  }
  const product = prodData.docs[0];
  console.log(`Using product: ${product.name} (ID: ${product._id})`);

  console.log('\n4. Creating order...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items: [{
        product: product._id,
        vendor: product.vendor.id,
        quantity: 1,
        priceAtPurchase: product.price
      }]
    })
  });
  if (!orderRes.ok) {
    throw new Error(`Order creation failed: ${await orderRes.text()}`);
  }
  const orderData = await orderRes.json();
  const orderId = orderData.data._id;
  console.log(`Created order: ${orderId}`);

  console.log('\n5. Creating payment intent...');
  const paymentRes = await fetch(`${BASE_URL}/payments/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId,
      amount: product.price,
      gateway: 'STRIPE'
    })
  });
  if (!paymentRes.ok) {
    throw new Error(`Payment processing failed: ${await paymentRes.text()}`);
  }
  const paymentData = await paymentRes.json();
  const clientSecret = paymentData.gatewayData.client_secret || paymentData.gatewayData.id;
  console.log(`Payment Intent created. Transaction/Client Secret: ${clientSecret}`);

  console.log('\n6. Confirming mock payment...');
  const confirmRes = await fetch(`${BASE_URL}/payments/mock-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ transactionId: clientSecret })
  });
  if (!confirmRes.ok) {
    throw new Error(`Mock confirm failed: ${await confirmRes.text()}`);
  }
  console.log('Mock payment confirmed. Waiting 3 seconds for async event processing...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n7. Checking order status...');
  const getOrderRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!getOrderRes.ok) {
    throw new Error(`Fetch order failed: ${await getOrderRes.text()}`);
  }
  const getOrderData = await getOrderRes.json();
  console.log('Order status:', getOrderData.data.orderStatus);
  console.log('Order details:', JSON.stringify(getOrderData.data, null, 2));
}

run().catch(err => {
  console.error('Test run failed:', err);
});
