const http = require('http');

function get(port, path) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: 'localhost', port, path, method: 'GET' }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    req.end();
  });
}

async function main() {
  console.log('--- Testing Port 5004 (Admin Service) ---');
  const endpoints = ['/api/admin/stats', '/api/admin/blog', '/api/admin/reviews', '/api/admin/earnings', '/api/admin/settings', '/api/admin/announcements'];
  for (const ep of endpoints) {
    const r = await get(5004, ep);
    console.log(`${ep}: STATUS=${r.status} BODY=${r.body.substring(0, 80)}`);
  }

  console.log('\n--- Testing Port 5000 (Gateway) ---');
  for (const ep of endpoints) {
    const r = await get(5000, ep);
    console.log(`${ep}: STATUS=${r.status} BODY=${r.body.substring(0, 80)}`);
  }
}
main();
