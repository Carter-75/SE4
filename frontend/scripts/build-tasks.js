const fs = require('fs');
const path = require('path');

function replaceEnv() {
  const file = path.join(__dirname, '..', 'src', 'app', 'services', 'api.service.ts');
  if (!fs.existsSync(file)) {
    console.log('[build-tasks] Skipping env replacement: ' + file + ' not found.');
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace('__PRODUCTION__', process.env.PRODUCTION || 'false')
    .replace('__PROD_BACKEND_URL__', process.env.PROD_BACKEND_URL || '')
    .replace('__PROD_FRONTEND_URL__', process.env.PROD_FRONTEND_URL || '');

  fs.writeFileSync(file, content);
  console.log('[build-tasks] Applied environment variables to ' + file);
}

function normalizeOutput() {
  const src = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
  const dest = path.join(__dirname, '..', 'dist', 'frontend');

  if (fs.existsSync(src)) {
    console.log('[build-tasks] Normalizing output: moving ' + src + ' to ' + dest);
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true });
    console.log('[build-tasks] Output normalization complete.');
  } else {
    console.log('[build-tasks] Skipping normalization: ' + src + ' not found.');
  }
}

const task = process.argv[2];
if (task === 'prebuild') replaceEnv();
else if (task === 'postbuild') normalizeOutput();
