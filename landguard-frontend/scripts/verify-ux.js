import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getAllFiles(dir, exts = ['.jsx', '.js', '.css', '.html']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files = files.concat(getAllFiles(fullPath, exts));
      }
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

console.log('--- LandGuard AI UX & De-AI Verification Suite ---\n');
let failed = false;

const allFiles = getAllFiles(srcDir);
allFiles.push(path.resolve(__dirname, '../index.html'));

// Test 1: Banned Fonts (Inter, Roboto, Arial, Helvetica, Open Sans)
console.log('1. Checking for banned fonts (Inter, Roboto, Arial, Helvetica, Open Sans)...');
const bannedFontRegex = /\b(Inter|Roboto|Arial|Open Sans|Helvetica)\b/i;
let bannedFontViolations = [];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Exclude legitimate word "inter-departmental" or similar compound English words
    const cleanLine = line.replace(/inter-departmental/gi, '');
    if (bannedFontRegex.test(cleanLine)) {
      bannedFontViolations.push(`${path.relative(srcDir, file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}
if (bannedFontViolations.length > 0) {
  console.error('FAIL: Found banned font references:');
  bannedFontViolations.forEach((v) => console.error('  ', v));
  failed = true;
} else {
  console.log('  PASS: 0 banned font occurrences found.');
}

// Test 2: Arbitrary bracket text sizes (text-[11px], text-[10px], etc.)
console.log('2. Checking for arbitrary bracket text sizes (text-[...])...');
const bracketTextRegex = /text-\[\d+/;
let bracketTextViolations = [];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (bracketTextRegex.test(line)) {
      bracketTextViolations.push(`${path.relative(srcDir, file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}
if (bracketTextViolations.length > 0) {
  console.error('FAIL: Found arbitrary bracket text sizes:');
  bracketTextViolations.forEach((v) => console.error('  ', v));
  failed = true;
} else {
  console.log('  PASS: 0 arbitrary bracket text sizes found.');
}

// Test 3: Arbitrary z-index hacks (z-[9999], etc.)
console.log('3. Checking for arbitrary z-index stacking hacks (z-[...])...');
const zIndexRegex = /z-\[\d+/;
let zIndexViolations = [];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (zIndexRegex.test(line)) {
      zIndexViolations.push(`${path.relative(srcDir, file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}
if (zIndexViolations.length > 0) {
  console.error('FAIL: Found arbitrary z-index hacks:');
  zIndexViolations.forEach((v) => console.error('  ', v));
  failed = true;
} else {
  console.log('  PASS: 0 arbitrary z-index hacks found.');
}

// Test 4: Viewport units (100vh)
console.log('4. Checking for 100vh occurrences...');
const vhRegex = /100vh\b/;
let vhViolations = [];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (vhRegex.test(line)) {
      vhViolations.push(`${path.relative(srcDir, file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}
if (vhViolations.length > 0) {
  console.error('FAIL: Found 100vh occurrences:');
  vhViolations.forEach((v) => console.error('  ', v));
  failed = true;
} else {
  console.log('  PASS: 0 100vh occurrences found (all use 100dvh or percentage).');
}

// Test 5: Em dashes in synthetic UI copy
console.log('5. Checking for em dashes in synthetic UI copy...');
let uiEmDashViolations = [];
for (const file of allFiles) {
  // DocumentIntakeView.jsx is allowed authentic dashes for statutory documents
  if (path.basename(file) === 'DocumentIntakeView.jsx') continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('—') || line.includes('–')) {
      uiEmDashViolations.push(`${path.relative(srcDir, file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}
if (uiEmDashViolations.length > 0) {
  console.error('FAIL: Found em/en dashes in UI copy:');
  uiEmDashViolations.forEach((v) => console.error('  ', v));
  failed = true;
} else {
  console.log('  PASS: 0 em/en dashes found in synthetic UI copy.');
}

// Test 6: Verify reduced motion media query in index.css
console.log('6. Checking prefers-reduced-motion in index.css...');
const cssContent = fs.readFileSync(path.resolve(srcDir, 'index.css'), 'utf8');
if (!cssContent.includes('prefers-reduced-motion')) {
  console.error('FAIL: prefers-reduced-motion media query missing from index.css');
  failed = true;
} else {
  console.log('  PASS: prefers-reduced-motion media query present.');
}

// Test 7: Verify static base64 noise texture (no live SVG feTurbulence filter)
console.log('7. Checking static base64 texture (zero live SVG feTurbulence)...');
if (cssContent.includes('feTurbulence')) {
  console.error('FAIL: live feTurbulence SVG filter found in index.css (should be static base64 PNG)');
  failed = true;
} else if (!cssContent.includes('data:image/png;base64,')) {
  console.error('FAIL: static base64 noise PNG missing from index.css');
  failed = true;
} else {
  console.log('  PASS: static base64 noise PNG verified.');
}

console.log('\n----------------------------------------');
if (failed) {
  console.error('OVERALL RESULT: FAILED');
  process.exit(1);
} else {
  console.log('OVERALL RESULT: ALL CHECKS PASSED (100% COMPLIANT)');
  process.exit(0);
}
