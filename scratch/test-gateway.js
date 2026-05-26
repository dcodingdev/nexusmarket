async function test() {
  const endpoints = [
    'http://localhost:8000/health',
    'http://localhost:8000/api/v1/auth/health',
    'http://localhost:8000/api/v1/products/health',
    'http://localhost:8000/api/v1/orders/health',
    'http://localhost:8000/api/v1/payments/health'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Body: ${text.slice(0, 100)}\n`);
    } catch (e) {
      console.error(`URL: ${url} failed: ${e.message}\n`);
    }
  }
}

test();
