#!/usr/bin/env node

/**
 * Generate missing PNG image assets for GitHub Pages sites
 * Creates og-image.png (1200×630) and apple-touch-icon.png (180×180)
 * for all active sites per dhruvinrsoni.github.io/TODO.md
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

const sites = [
  {
    name: 'Dhruvin Soni — Launchpad',
    dir: 'dhruvinrsoni.github.io',
    tagline: 'Projects, Apps & Profiles',
  },
  {
    name: 'Portfolio',
    dir: 'dhruvinrsoni',
    subdir: 'assets',
    tagline: 'Senior Software Engineer',
  },
  {
    name: 'power-user-scripts',
    dir: 'power-user-scripts',
    subdir: '.github/pages/docs',
    tagline: 'Scripts & Tools Toolkit',
  },
  {
    name: 'agentskills-garden',
    dir: 'agentskills-garden',
    subdir: 'scripts/site_templates',
    tagline: 'AI Skill Library',
  },
];

const COLORS = {
  bgDark: '#0d1117',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
  accentBlue: '#0a84ff',
};

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return String(str).replace(/[&<>"']/g, (char) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
    return map[char];
  });
}

/**
 * Generate SVG for og-image (1200×630)
 * Layout: left accent bar, centered site name + tagline
 */
function generateOgImageSvg(siteName, tagline) {
  const safeName = escapeXml(siteName);
  const safeTagline = escapeXml(tagline);
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="${COLORS.bgDark}"/><rect width="12" height="630" fill="${COLORS.accentBlue}"/><text x="120" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="600" fill="${COLORS.textPrimary}">${safeName}</text><text x="120" y="340" font-family="Arial, sans-serif" font-size="32" fill="${COLORS.textMuted}">${safeTagline}</text></svg>`;
  return svg;
}

/**
 * Generate SVG for apple-touch-icon (180×180)
 * Layout: centered initials or simple badge
 */
function generateAppleTouchIconSvg(siteName) {
  const initials = siteName
    .split(/[\s-&]/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const safeInitials = escapeXml(initials);
  const svg = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="${COLORS.bgDark}"/><rect width="180" height="180" rx="40" fill="none" stroke="${COLORS.accentBlue}" stroke-width="2"/><text x="90" y="95" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="${COLORS.accentBlue}" text-anchor="middle">${safeInitials}</text></svg>`;
  return svg;
}

async function generateAssetsForSite(site) {
  const baseDir = path.join(WORKSPACE_ROOT, site.dir);
  const outputDir = site.subdir ? path.join(baseDir, site.subdir) : baseDir;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`  📁 Created directory: ${outputDir}`);
  }

  try {
    // Generate og-image.png (1200×630)
    const ogImageSvg = generateOgImageSvg(site.name, site.tagline);
    const ogImagePath = path.join(outputDir, 'og-image.png');
    await sharp(Buffer.from(ogImageSvg)).png().toFile(ogImagePath);
    console.log(`  ✓ ${ogImagePath}`);

    // Generate apple-touch-icon.png (180×180)
    const appleTouchSvg = generateAppleTouchIconSvg(site.name);
    const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(Buffer.from(appleTouchSvg)).png().toFile(appleTouchPath);
    console.log(`  ✓ ${appleTouchPath}`);
  } catch (err) {
    console.error(`  ✗ Error generating assets for ${site.name}: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('\n🎨 Generating PNG image assets for GitHub Pages sites\n');

  try {
    for (const site of sites) {
      console.log(`${site.name}:`);
      await generateAssetsForSite(site);
      console.log();
    }

    console.log('✅ All assets generated successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Uncomment image: line in dhruvinrsoni/_config.yml');
    console.log('   2. Update agentskills-garden/scripts/build_site.py to copy og-image + apple-touch-icon');
    console.log('   3. Test with https://metatags.io/ to verify OG previews');
    console.log('   4. Check off items in dhruvinrsoni.github.io/TODO.md\n');
  } catch (err) {
    console.error('❌ Asset generation failed:', err);
    process.exit(1);
  }
}

main();
