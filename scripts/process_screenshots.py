import os
import sys
from PIL import Image

SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'App Screenshot')
OUT_DIR = os.path.join(SRC_DIR, 'playstore')

os.makedirs(OUT_DIR, exist_ok=True)

files = sorted([f for f in os.listdir(SRC_DIR) if f.endswith('.jpg')])
print(f"Found {len(files)} screenshots")

names = [
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
]

for i, file in enumerate(files):
    src_path = os.path.join(SRC_DIR, file)
    out_name = names[i] if i < len(names) else f'screenshot-{i+1}'
    out_path = os.path.join(OUT_DIR, f'{out_name}.png')
    
    try:
        img = Image.open(src_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        w, h = img.size
        print(f"  {file}: {w}x{h}")
        
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
        img.save(out_path, 'PNG')
        print(f"  [OK] Saved: {out_name}.png (1080x1920)")
    except Exception as e:
        print(f"  [FAIL] {file}: {e}")

print(f"\n[OK] All screenshots processed!")
print(f"Output directory: {OUT_DIR}")