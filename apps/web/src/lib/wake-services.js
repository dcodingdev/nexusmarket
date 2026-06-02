/**
 * wake-services.js
 * Place: app/web/src/lib/wake-services.js  (or utils/wake-services.js)
 *
 * Pings all 5 backend services simultaneously through the nginx gateway.
 * Call wakeAllServices() on app load so services spin up before user interacts.
 *
 * Usage:
 *   import { wakeAllServices } from '@/lib/wake-services';
 *   // In _app.tsx / layout.tsx / providers.tsx — call once on mount
 *   useEffect(() => { wakeAllServices(); }, []);
 */

const GATEWAY = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
    || 'https://nexusmarket-gateway.onrender.com';

const HEALTH_ENDPOINTS = [
    { name: 'auth', url: `${GATEWAY}/api/auth/health` },
    { name: 'products', url: `${GATEWAY}/api/products/health` },
    { name: 'orders', url: `${GATEWAY}/api/orders/health` },
    { name: 'payments', url: `${GATEWAY}/api/payments/health` },
    { name: 'chat', url: `${GATEWAY}/api/chat/health` },
];

/**
 * Ping one service. Returns { name, status, ok, ms }
 */
async function pingService({ name, url }) {
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(15000), // 15s — render cold start can be slow
        });
        return { name, status: res.status, ok: res.ok, ms: Date.now() - start };
    } catch (err) {
        return { name, status: 0, ok: false, ms: Date.now() - start, error: err.message };
    }
}

/**
 * Wake all services in parallel. Logs results to console (dev only).
 * Returns array of results — you can use this to show a "warming up" UI.
 *
 * @returns {Promise<Array<{name, status, ok, ms}>>}
 */
export async function wakeAllServices() {
    console.log('[NexusMarket] Waking all backend services...');

    const results = await Promise.all(HEALTH_ENDPOINTS.map(pingService));

    if (process.env.NODE_ENV === 'development') {
        results.forEach(({ name, status, ok, ms }) => {
            const icon = ok ? '✅' : '❌';
            console.log(`${icon} ${name}: ${status} (${ms}ms)`);
        });
    }

    const allUp = results.every(r => r.ok);
    console.log(`[NexusMarket] Services ${allUp ? 'all UP ✅' : 'some still warming up ⏳'}`);

    return results;
}

/**
 * Optional: wake with retry.
 * Retries failed services up to `retries` times with `delayMs` gap.
 * Useful if you want to show a loading screen until all services respond.
 */
export async function wakeAllServicesWithRetry(retries = 3, delayMs = 5000) {
    let pending = [...HEALTH_ENDPOINTS];
    const results = {};

    for (let attempt = 1; attempt <= retries; attempt++) {
        const batch = await Promise.all(pending.map(pingService));
        batch.forEach(r => { results[r.name] = r; });

        pending = pending.filter(ep => !results[ep.name]?.ok);
        if (pending.length === 0) break;

        if (attempt < retries) {
            console.log(`[NexusMarket] Retrying ${pending.map(e => e.name).join(', ')} in ${delayMs}ms...`);
            await new Promise(res => setTimeout(res, delayMs));
        }
    }

    return Object.values(results);
}
