/**
 * Process app screenshots for Play Store
 * Converts JPG screenshots to properly named PNG files at 1080x1920
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.resolve(__dirname, '..', 'App Screenshot');
const OUT_DIR = path.resolve(__dirname, '..', 'App Screenshot', 'playstore');

// Create output directory
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Read all screenshots
const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.jpg'));

// Sort by timestamp (from filename)
files.sort();

console.log(`Found ${files.length} screenshots`);

// Play Store screenshot names
const names = [
  '01-welcome-screen',
  '02-home-screen',
  '03-categories',
  '04-practice-chapters',
  '05-question-options',
  '06-mock-exam',
  '07-exam-results',
  '08-answer-review',
  '09-analytics',
  '10-bookmarks',
];

files.forEach((file, i) => {
  const srcPath = path.join(SRC_DIR, file);
  const outName = i < names.length ? names[i] : `screenshot-${i + 1}`;
  const outPath = path.join(OUT_DIR, `${outName}.png`);
  
  try {
    // Use Python PIL to convert and resize
    const script = `
import sys
from PIL import Image

img = Image.open(r"${srcPath}")
# Convert to RGB if needed
if img.mode != 'RGB':
    img = img.convert('RGB')

# Get dimensions
w, h = img.size
print(f"Original: {w}x{h}")

# Resize to 1080x1920 (maintain aspect ratio, crop if needed)
target_w, target_h = 1080, 1920
target_ratio = target_w / target_h
img_ratio = w / h

if img_ratio > target_ratio:
    # Too wide - crop width
    new_w = int(h * target_ratio)
    left = (w - new_w) // 2
    img = img.crop((left, 0, left + new_w, h))
else:
    # Too tall - crop height
    new_h = int(w / target_ratio)
    top = (h - new_h) // 2
    img = img.crop((0, top, w, top + new_h))

# Resize to target
img = img.resize((target_w, target_h), Image.LANCZOS)
img.save(r"${outPath}", "PNG")
print(f"Saved: ${outName}.png (1080x1920)")
`;
    
    execSync(`python -c "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
    console.log(`✅ ${file} -> ${outName}.png`);
  } catch (e) {
    console.error(`❌ Failed to process ${file}:`, e.message);
  }
});

console.log('\n✅ All screenshots processed!');
console.log(`Output directory: ${OUT_DIR}`);