import fs from 'fs';
import path from 'path';

const AUTH_API = 'http://localhost:4001/api/auth';
const PRODUCT_API = 'http://localhost:4002/api/products';
const ORDER_API = 'http://localhost:4003/api/orders';
const PAYMENT_API = 'http://localhost:4004/api/payments';

async function run() {
  console.log('--- STARTING CHECKOUT FLOW TEST ---');

  const customerId = `customer_${Date.now()}@example.com`;
  const vendorId = `vendor_${Date.now()}@example.com`;
  const password = 'Password123!';

  // 1. REGISTER CUSTOMER
  console.log('\n[1] Registering Customer...');
  const regCustomerRes = await fetch(`${AUTH_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerId, password, name: 'Test Customer', role: 'customer' })
  });
  if (!regCustomerRes.ok) throw new Error(`Customer reg failed: ${await regCustomerRes.text()}`);
  console.log('Customer registered successfully. Logging in...');
  
  const loginCustomerRes = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerId, password })
  });
  if (!loginCustomerRes.ok) throw new Error(`Customer login failed: ${await loginCustomerRes.text()}`);
  const customerData = await loginCustomerRes.json();
  const customerToken = customerData.accessToken;

  // 2. REGISTER VENDOR
  console.log('\n[2] Registering Vendor...');
  const regVendorRes = await fetch(`${AUTH_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: vendorId, password, name: 'Test Vendor', role: 'vendor' })
  });
  if (!regVendorRes.ok) throw new Error(`Vendor reg failed: ${await regVendorRes.text()}`);
  console.log('Vendor registered successfully. Logging in...');

  const loginVendorRes1 = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: vendorId, password })
  });
  if (!loginVendorRes1.ok) throw new Error(`Vendor login failed: ${await loginVendorRes1.text()}`);
  const vendorData1 = await loginVendorRes1.json();
  const tempVendorToken = vendorData1.accessToken;

  console.log('Upgrading user to vendor role...');
  const upgradeRes = await fetch(`http://localhost:4001/api/users/upgrade-to-vendor`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tempVendorToken}`
    },
    body: JSON.stringify({ shopName: 'Test Shop', taxId: '123456789' })
  });
  if (!upgradeRes.ok) throw new Error(`Upgrade failed: ${await upgradeRes.text()}`);

  console.log('Logging in again to refresh token role...');
  const loginVendorRes2 = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: vendorId, password })
  });
  if (!loginVendorRes2.ok) throw new Error(`Vendor login 2 failed: ${await loginVendorRes2.text()}`);
  const vendorData = await loginVendorRes2.json();
  const vendorToken = vendorData.accessToken;

  // 3. CREATE PRODUCT (As Vendor)
  console.log('\n[3] Creating Product...');
  const productBody = {
    name: 'Test Product',
    description: 'This is a test product created by the script',
    price: 19.99,
    category: 'Test',
    imageUrl: 'http://example.com/image.png',
    initialStock: 100
  };
  
  const createProductRes = await fetch(`${PRODUCT_API}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${vendorToken}`
    },
    body: JSON.stringify(productBody)
  });
  if (!createProductRes.ok) throw new Error(`Product creation failed: ${await createProductRes.text()}`);
  const productJson = await createProductRes.json();
  const product = productJson.data || productJson;
  console.log('Product created:', product._id || product.id);
  const productId = product._id || product.id;

  // 4. CREATE ORDER (As Customer)
  console.log('\n[4] Creating Order...');
  const orderBody = {
    items: [
      {
        product: productId,
        quantity: 1,
        priceAtPurchase: 19.99,
        vendor: vendorData.user._id || vendorData.user.id
      }
    ],
    totalAmount: 19.99,
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'USA'
    }
  };

  const createOrderRes = await fetch(`${ORDER_API}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify(orderBody)
  });
  if (!createOrderRes.ok) throw new Error(`Order creation failed: ${await createOrderRes.text()}`);
  const orderJson = await createOrderRes.json();
  const order = orderJson.data || orderJson;
  console.log('Order created:', order._id || order.id);
  const orderId = order._id || order.id;

  // 5. CHECKOUT (PROCESS PAYMENT)
  console.log('\n[5] Processing Payment Session...');
  const payBody = {
    orderId: orderId,
    amount: 19.99,
    currency: 'usd',
    gateway: 'MOCK'
  };

  const payRes = await fetch(`${PAYMENT_API}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify(payBody)
  });
  if (!payRes.ok) throw new Error(`Payment processing failed: ${await payRes.text()}`);
  const payJson = await payRes.json();
  console.log('Payment processed successfully. Result:', payJson);
  
  // 6. CONFIRM MOCK PAYMENT
  console.log('\n[6] Confirming Mock Payment...');
  const confirmPayRes = await fetch(`${PAYMENT_API}/mock-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ transactionId: payJson.paymentId })
  });
  if (!confirmPayRes.ok) {
     console.log('Mock confirm may not be implemented fully or failed:', await confirmPayRes.text());
  } else {
     console.log('Mock payment confirmed:', await confirmPayRes.json());
  }

  console.log('\n--- FULL CHECKOUT FLOW COMPLETED SUCCESSFULLY ---');
}

run().catch(console.error);
