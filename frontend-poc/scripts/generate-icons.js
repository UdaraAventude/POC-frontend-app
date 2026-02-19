#!/usr/bin/env node
/**
 * Generate PNG icons from the SVG icon source.
 * Run: node scripts/generate-icons.js
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

const sizes = [
  { width: 192, name: 'icon-192.png', path: 'icons' },
  { width: 512, name: 'icon-512.png', path: 'icons' },
  { width: 1280, height: 720, name: 'screenshot-wide.png', path: 'screenshots', src: 'screenshot-wide.svg' },
  { width: 540, height: 720, name: 'screenshot-mobile.png', path: 'screenshots', src: 'screenshot-mobile.svg' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons and screenshots...\n');

  for (const config of sizes) {
    const isScreenshot = config.path === 'screenshots';
    const srcFile = isScreenshot ? config.src : 'icon.svg';
    const svgPath = join(publicDir, isScreenshot ? 'screenshots' : '', srcFile);
    const outputPath = join(publicDir, config.path, config.name);

    try {
      const svgBuffer = await readFile(svgPath);
      
      const sharpInstance = sharp(svgBuffer);
      
      if (config.height) {
        // Screenshot with specific dimensions
        await sharpInstance
          .resize(config.width, config.height)
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(outputPath);
      } else {
        // Square icon
        await sharpInstance
          .resize(config.width, config.width)
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(outputPath);
      }

      console.log(`✓ Generated ${config.name} (${config.width}${config.height ? `×${config.height}` : `×${config.width}`})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${config.name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All icons and screenshots generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Deploy to Netlify');
  console.log('   3. Test PWA in Chrome (NOT InPrivate mode)');
  console.log('   4. Check: DevTools → Application → Manifest');
}

generateIcons().catch((error) => {
  console.error('Failed to generate icons:', error);
  process.exit(1);
});
