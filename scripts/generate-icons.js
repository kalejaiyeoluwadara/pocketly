/**
 * Script to generate PWA icons
 * Run with: node scripts/generate-icons.js
 * 
 * Note: This script requires sharp to be installed
 * Install with: npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple wallet icon SVG
const walletIconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#18181b"/>
  <path d="M256 128C200 128 152 160 128 208C128 256 176 288 232 288H280C336 288 384 256 384 208C360 160 312 128 256 128Z" fill="#ffffff" opacity="0.9"/>
  <rect x="128" y="240" width="256" height="144" rx="20" fill="#ffffff" opacity="0.9"/>
  <circle cx="256" cy="312" r="24" fill="#18181b"/>
</svg>
`;

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-icon.png' },
];

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const { size, name } of sizes) {
    try {
      await sharp(Buffer.from(walletIconSVG))
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
      console.log('\nTip: Install sharp with: npm install --save-dev sharp');
    }
  }
}

generateIcons();

