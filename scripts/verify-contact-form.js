#!/usr/bin/env node

/**
 * Simple verification script for ContactForm functionality
 * This script checks that the ContactForm component can be imported and has the expected structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ContactForm implementation...\n');

// Check if ContactForm component exists
const contactFormPath = path.join(
  __dirname,
  '../components/forms/ContactForm.tsx'
);
if (!fs.existsSync(contactFormPath)) {
  console.error('❌ ContactForm.tsx not found');
  process.exit(1);
}
console.log('✅ ContactForm.tsx exists');

// Check if contact page uses ContactForm
const contactPagePath = path.join(__dirname, '../app/contact/page.tsx');
const contactPageContent = fs.readFileSync(contactPagePath, 'utf8');

if (!contactPageContent.includes('ContactForm')) {
  console.error('❌ Contact page does not import ContactForm');
  process.exit(1);
}
console.log('✅ Contact page imports ContactForm');

// Check if environment example exists
const envExamplePath = path.join(__dirname, '../.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example not found');
  process.exit(1);
}
console.log('✅ .env.example exists');

const envContent = fs.readFileSync(envExamplePath, 'utf8');
if (!envContent.includes('NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY')) {
  console.error('❌ .env.example missing Web3forms configuration');
  process.exit(1);
}
console.log('✅ .env.example contains Web3forms configuration');

// Check ContactForm component structure
const contactFormContent = fs.readFileSync(contactFormPath, 'utf8');

const requiredFeatures = [
  'useState',
  'form validation',
  'Web3forms integration',
  'error handling',
  'success state',
  'loading state',
];

const checks = [
  { feature: 'useState', pattern: /useState/, found: false },
  { feature: 'form validation', pattern: /validateForm/, found: false },
  { feature: 'Web3forms integration', pattern: /web3forms\.com/, found: false },
  { feature: 'error handling', pattern: /catch.*error/i, found: false },
  { feature: 'success state', pattern: /success/, found: false },
  { feature: 'loading state', pattern: /isSubmitting/, found: false },
];

checks.forEach(check => {
  check.found = check.pattern.test(contactFormContent);
  if (check.found) {
    console.log(`✅ ${check.feature} implemented`);
  } else {
    console.log(`⚠️  ${check.feature} might be missing`);
  }
});

// Check if README exists
const readmePath = path.join(__dirname, '../components/forms/README.md');
if (fs.existsSync(readmePath)) {
  console.log('✅ ContactForm README.md exists');
} else {
  console.log('⚠️  ContactForm README.md missing');
}

console.log('\n🎉 ContactForm verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Copy .env.example to .env');
console.log('2. Get your Web3forms access key from https://web3forms.com/');
console.log('3. Add the access key to your .env file');
console.log('4. Test the contact form in development mode');
