const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'Gateway', path: 'gateway.js' },
  { name: 'PDF Service', path: 'services/pdfService.js' },
  { name: 'Image Service', path: 'services/imageService.js' },
  { name: 'Office Service', path: 'services/officeService.js' },
  { name: 'Admin Service', path: 'services/adminService.js' }
];

console.log('Starting DocTools Microservices...');

services.forEach(service => {
  const child = spawn('node', [service.path], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`Failed to start ${service.name}:`, err);
  });

  console.log(`[+] ${service.name} initialized`);
});

process.on('SIGINT', () => {
  console.log('\nStopping all services...');
  process.exit();
});
