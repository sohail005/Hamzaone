const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve('./out');
const cssDir = path.join(outDir, '_next/static/chunks');

if (!fs.existsSync(cssDir)) {
  console.error('CSS chunk directory not found:', cssDir);
  process.exit(1);
}

const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

if (files.length === 0) {
  console.error('No CSS file found in', cssDir);
  process.exit(1);
}

const cssFile = path.join(cssDir, files[0]);
console.log('Regenerating Tailwind CSS:', cssFile);

execSync(
  `npx tailwindcss -i ./app/globals.css -o "${cssFile}" --content "./out/**/*.html"`,
  { stdio: 'inherit' }
);

console.log('Tailwind CSS regenerated successfully');
