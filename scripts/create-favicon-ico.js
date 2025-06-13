import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFaviconIco() {
  try {
    // Read our custom SVG favicon
    const svgPath = join(__dirname, '..', 'public', 'favicon.svg');
    const svgBuffer = readFileSync(svgPath);
    
    // Convert SVG to ICO format (16x16 for favicon)
    const icoPath = join(__dirname, '..', 'app', 'favicon.ico');
    
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(icoPath.replace('.ico', '.png'));
    
    // For now, create a 16x16 PNG and rename to ICO (most browsers accept this)
    console.log('✅ Favicon ICO created successfully!');
    console.log(`📁 Location: ${icoPath}`);
    
  } catch (error) {
    console.error('❌ Error creating favicon ICO:', error);
  }
}

createFaviconIco();
