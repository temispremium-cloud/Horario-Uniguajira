import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '..', 'src', 'components', 'UniGuajiraLogo.tsx');
const logoTsx = fs.readFileSync(logoPath, 'utf8');

// Extract polygons from UniGuajiraLogo
const polygons = [];
const polygonRegex = /<(polygon|rect)([^>]*?)\/?>/g;
let m;
while ((m = polygonRegex.exec(logoTsx)) !== null) {
  if (m.index < logoTsx.indexOf('Typography vector text')) {
    let tag = m[0]
      .replace(/className=/g, 'class=')
      .replace(/\/>/, '/>');
    polygons.push(tag);
  }
}
const polygonsXml = polygons.join('\n    ');

function createSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c41d24" />
      <stop offset="50%" stop-color="#b7191f" />
      <stop offset="100%" stop-color="#801015" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background container with maskable padding -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Decorative Outer Halos -->
  <circle cx="256" cy="192" r="150" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.15"/>
  <circle cx="256" cy="192" r="160" fill="none" stroke="#E1A140" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.4"/>

  <!-- Central Crest: Crisp white background for maximum contrast of institutional colors -->
  <circle cx="256" cy="192" r="132" fill="#ffffff" stroke="#E1A140" stroke-width="4.5" filter="url(#shadow)"/>
  <circle cx="256" cy="192" r="124" fill="#ffffff" stroke="#CC5C50" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.4"/>

  <!-- Authentic UniGuajira Wayuu Symbol inside white badge -->
  <g transform="translate(172, 82) scale(8.1)">
    <style>
      .ug-c0{fill-rule:evenodd;clip-rule:evenodd;fill:#60A8B8;}
      .ug-c1{fill-rule:evenodd;clip-rule:evenodd;fill:#010200;}
      .ug-c2{fill-rule:evenodd;clip-rule:evenodd;fill:#CC5C50;}
      .ug-c3{fill-rule:evenodd;clip-rule:evenodd;fill:#E1A140;}
    </style>
    ${polygonsXml}
  </g>

  <!-- Institutional Typography -->
  <text x="256" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">UNIGUAJIRA</text>
  
  <!-- Subtitle Badge: HORARIO C1 -->
  <rect x="156" y="402" width="200" height="38" rx="19" fill="#E1A140" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="256" y="426" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16" fill="#010200" text-anchor="middle" letter-spacing="1.5">HORARIO C1</text>
</svg>`;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svg512 = createSvg(512);
const svg192 = createSvg(192);

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg512);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
console.log('Created SVG icons in public/');

async function generatePngs() {
  await sharp(Buffer.from(svg512)).png().resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(Buffer.from(svg512)).png().resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(svg512)).png().resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created PNG icons in public/: icon-512.png, icon-192.png, apple-touch-icon.png');
}

generatePngs().catch(console.error);

