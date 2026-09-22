import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OUT_W, OUT_H = 1024, 500
SCALE = 3
W, H = OUT_W * SCALE, OUT_H * SCALE

FONT_DIR = r'D:\React Native\Nurse Exam Preparation\node_modules\.pnpm\@expo-google-fonts+inter@0.4.2\node_modules\@expo-google-fonts\inter'
def F(weight, size):
    p = os.path.join(FONT_DIR, weight, 'Inter_%s.ttf' % weight)
    return ImageFont.truetype(p, size * SCALE)

# font kit (sizes at display scale; rendered at size*SCALE)
f_pill     = F('700Bold', 13)
f_pill_spc = F('700Bold', 12)
f_title1   = F('800ExtraBold', 50)
f_title2   = F('800ExtraBold', 50)
f_tag      = F('400Regular', 19)
f_tag_b    = F('600SemiBold', 19)
f_chip     = F('600SemiBold', 15)
f_disc     = F('400Regular', 11)
f_phone_time = F('600SemiBold', 11)
f_phone_h   = F('700Bold', 16)
f_phone_sub = F('600SemiBold', 11)
f_phone_pr  = F('600SemiBold', 12)
f_phone_q   = F('600SemiBold', 16)
f_phone_o   = F('600SemiBold', 14)
f_phone_lb  = F('600SemiBold', 12)
f_phone_ls  = F('400Regular', 9)
f_ring      = F('800ExtraBold', 21)
f_badge_b   = F('800ExtraBold', 26)
f_badge_s   = F('600SemiBold', 11)

WHITE  = (255, 255, 255)
CYAN   = (8, 145, 178)
CYAN_D = (14, 116, 144)
CYAN_L = (165, 243, 252)   # cyan-200
SKY_L  = (224, 242, 254)   # sky-50
SKY_200= (186, 230, 253)
TEAL_50= (240, 253, 250)
GREEN  = (16, 185, 129)
GREEN_D= (5, 150, 105)
AMBER  = (245, 158, 11)
ORANGE_D = (180, 83, 9)
SLATE2 = (226, 232, 240)
SLATE3 = (203, 213, 225)
SLATE4 = (148, 163, 184)
SLATE5 = (100, 116, 139)
SLATE6 = (71, 85, 105)
SLATE8 = (30, 41, 59)
DARK   = (10, 22, 40)
BG_LIGHT = (249, 251, 253)
BORDER  = (226, 232, 240)

def rr(dr, box, radius, fill=None, outline=None, width=1):
    dr.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def txt(dr, px, py, s, font, fill, anchor='la'):
    dr.text((px, py), s, font=font, fill=fill, anchor=anchor)

def tw_fnt(font, s):
    d0 = ImageDraw.Draw(Image.new('RGB', (8, 8)))
    return d0.textlength(s, font=font)

def text_letter_spaced(dr, px, py, s, font, fill, tracking):
    """Draw text with extra letter-spacing (tracking in display px)."""
    x = px
    asc, desc = font.getmetrics()
    for ch in s:
        w = tw_fnt(font, ch)
        dr.text((x, py), ch, font=font, fill=fill, anchor='lm')
        x += w + int(tracking * SCALE)

def soft_shadow_text(dr, px, py, s, font, fill, shadow=(6, 18, 34, 90), off_y=2):
    """Draw text with a soft drop shadow behind it."""
    dr.text((px, py + off_y * SCALE), s, font=font, fill=shadow, anchor='la')
    dr.text((px, py), s, font=font, fill=fill, anchor='la')
# ---------------- background gradient ----------------
y_idx, x_idx = np.mgrid[0:H, 0:W]
t = (x_idx / W) * 0.62 + (y_idx / H) * 0.38
C = np.zeros((H, W, 3), dtype=np.float32)
top    = np.array([9, 122, 156], dtype=np.float32)
mid    = np.array([10, 92, 128], dtype=np.float32)
bottom = np.array([9, 40, 66], dtype=np.float32)
# two-segment vertical blend
seg = t.copy()
for c in range(3):
    C[:, :, c] = np.where(seg < 0.5,
                          top[c] + (mid[c] - top[c]) * (seg / 0.5),
                          mid[c] + (bottom[c] - mid[c]) * ((seg - 0.5) / 0.5))
img = Image.fromarray(C.astype(np.uint8), 'RGB').convert('RGBA')
d = ImageDraw.Draw(img, 'RGBA')

# soft radial glow behind phone
cxg, cyg, rg = int(0.83 * W), int(0.46 * H), int(0.56 * H)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for r in range(rg, 0, -60):
    a = int(16 * (1 - r / rg) + 5)
    gd.ellipse((cxg - r, cyg - r, cxg + r, cyg + r), fill=(165, 243, 252, a))
img.alpha_composite(glow)
d = ImageDraw.Draw(img, 'RGBA')

# fine dot grid lower-left (subtle texture)
dot = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ddw = ImageDraw.Draw(dot)
for gx in range(int(0.04*W), int(0.5*W), int(0.035*W)):
    for gy in range(int(0.72*H), int(0.92*H), int(0.035*W)):
        ddw.ellipse((gx, gy, gx + 3*SCALE, gy + 3*SCALE), fill=(255, 255, 255, 26))
img.alpha_composite(dot)
d = ImageDraw.Draw(img, 'RGBA')

# decorative rings
d.ellipse((int(0.70*W), int(-0.30*H), int(1.20*W), int(0.20*H)),
          outline=(186, 230, 253, 55), width=2*SCALE)
d.ellipse((int(-0.30*W), int(0.60*H), int(0.18*W), int(1.08*H)),
          outline=(186, 230, 253, 35), width=2*SCALE)

# ECG pulse line (subtle, behind phone bottom area)
ecg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ed = ImageDraw.Draw(ecg)
pts = []
x = int(0.36 * W)
ybase = int(0.90 * H)
span = W - x
n = 10
w = span // n
for i in range(n):
    x0 = x + i * w
    pts.append((x0, ybase))
    pts.append((x0 + int(w*0.16), ybase))
    pts.append((x0 + int(w*0.24), ybase - int(0.028*H)))
    pts.append((x0 + int(w*0.34), ybase + int(0.030*H)))
    pts.append((x0 + int(w*0.40), ybase))
    pts.append((x0 + int(w*0.50), ybase))
    pts.append((x0 + int(w*0.58), ybase - int(0.062*H)))
    pts.append((x0 + int(w*0.68), ybase + int(0.032*H)))
    pts.append((x0 + int(w*0.76), ybase))
pts.append((W, ybase))
ed.line(pts, fill=(255, 255, 255, 55), width=int(1.6*SCALE), joint='curve')
img.alpha_composite(ecg)
d = ImageDraw.Draw(img, 'RGBA')
# ---------------- logo badge (medical cross on white) ----------------
LX, LY, LS = int(0.068*W), int(0.30*H), int(0.086*W)   # 70, 150, 88
rr(d, (LX+5*SCALE, LY+7*SCALE, LX+LS+5*SCALE, LY+LS+7*SCALE), radius=int(0.026*W),
   fill=(6, 18, 34, 60))
rr(d, (LX, LY, LX+LS, LY+LS), radius=int(0.026*W), fill=WHITE)
# medical cross: vertical bar
bw = int(LS * 0.16)
bh = int(LS * 0.72)
ax = LX + (LS - bw)//2
ay = LY + (LS - bh)//2
rr(d, (ax, ay, ax + bw, ay + bh), radius=int(bw * 0.5), fill=CYAN)
# horizontal bar
hw = int(LS * 0.72)
hh = int(LS * 0.16)
hx = LX + (LS - hw)//2
hy = LY + (LS - hh)//2
rr(d, (hx, hy, hx + hw, hy + hh), radius=int(hh * 0.5), fill=CYAN)

# ---------------- left column ----------------
# eyebrow pill (letter-spaced over a cyan pill)
eyebrow = 'NURSING  MCQ  MASTERY'
EY = LY + LS + int(0.030*H)
pill_h = int(0.030*H)
sp_w = 0
for ch in eyebrow:
    sp_w += tw_fnt(f_pill_spc, ch) + int(1.4 * SCALE)
rr(d, (LX - int(0.010*W), EY, LX + sp_w + int(0.028*W), EY + pill_h),
   radius=int(0.015*H), fill=CYAN_L)
text_letter_spaced(d, LX + int(0.014*W), EY + pill_h//2, eyebrow, f_pill_spc, (7, 28, 52), tracking=1.4)

# Title block
TY = EY + pill_h + int(0.020*H)
soft_shadow_text(d, LX, TY, 'Nurse Exam', f_title1, WHITE, off_y=2)
soft_shadow_text(d, LX, TY + int(0.064*H), 'Preparation', f_title2, (206, 244, 252), off_y=2)
# thin accent underline
rw = tw_fnt(f_title2, 'Preparation')
rr(d, (LX + int(0.004*W), TY + int(0.132*H), LX + int(0.004*W) + rw, TY + int(0.132*H) + int(0.005*H)),
   radius=int(0.002*H), fill=(165, 243, 252, 200))

# Tagline — clean, two balanced lines
TG = TY + int(0.160*H)
txt(d, LX, TG, 'Master nursing exams with practice questions,', f_tag, (226, 240, 250))
txt(d, LX, TG + int(0.028*H), 'full mock tests & analytics — all offline.', f_tag, SKY_200)
# feature chips
chips = [('40,000+ MCQs', CYAN_L), ('Mock Exams', SKY_200), ('Offline Mode', CYAN_L)]
chip_y = TG + int(0.064*H)
chip_h = int(0.040*H)
cx = LX
for label, dotc in chips:
    wch = tw_fnt(f_chip, label) + int(0.030*W) + int(0.014*W)
    rr(d, (cx, chip_y, cx + wch, chip_y + chip_h), radius=int(0.020*H),
       fill=(255, 255, 255, 60), outline=(255, 255, 255, 120), width=1*SCALE)
    # check icon
    ckx, cky = cx + int(0.014*W), chip_y + chip_h//2
    pd_tmp = d
    # green check circle
    d.ellipse((ckx - int(0.009*W), cky - int(0.009*W),
               ckx + int(0.009*W), cky + int(0.009*W)), fill=GREEN)
    d.line((ckx - int(0.005*W), cky, ckx - int(0.001*W), cky + int(0.005*H)),
           fill=WHITE, width=int(1.4*SCALE))
    d.line((ckx - int(0.001*W), cky + int(0.005*H), ckx + int(0.005*W), cky - int(0.005*H)),
           fill=WHITE, width=int(1.4*SCALE))
    txt(d, cx + int(0.030*W), chip_y + chip_h//2, label, f_chip, WHITE, anchor='lm')
    cx += wch + int(0.012*W)

# disclaimer
txt(d, LX, H - int(0.026*H),
    'Independent study tool. Not affiliated with any government body or exam board.',
    f_disc, (186, 214, 230, 200))
# ---------------- phone mockup ---------------
PW, PH = int(0.30*W), int(0.92*H)           # ~307, 460
PX, PY = int(0.64*W), int(0.04*H)           # 655, 20
RAD = int(0.034*W)

phone = Image.new('RGBA', (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(phone, 'RGBA')

# frame + soft shadow
rr(pd, (PX-6*SCALE, PY-6*SCALE, PX+PW+6*SCALE, PY+PH+6*SCALE), radius=RAD+6*SCALE,
   fill=(4, 14, 26, 80))
rr(pd, (PX, PY, PX+PW, PY+PH), radius=RAD, fill=BG_LIGHT,
   outline=(8, 22, 42, 255), width=int(0.008*W))

MA = int(0.022*W)
SX, SY = PX + MA, PY + MA + int(0.008*W)
SWs, SHs = PW - 2*MA, PH - 2*MA - int(0.008*W)

# notch
nh = int(0.008*H)
pd.rounded_rectangle((PX+PW//2 - int(0.05*W), PY + int(0.006*H),
                      PX+PW//2 + int(0.05*W), PY + int(0.006*H) + nh),
                     radius=int(nh//2), fill=(12, 26, 46))

# status bar
txt(pd, SX + int(0.014*W), SY + int(0.012*H), '9:41', f_phone_time, SLATE8)
pd.ellipse((SX+SWs-int(0.022*W), SY+int(0.011*H), SX+SWs-int(0.008*W), SY+int(0.025*H)),
           fill=(12, 26, 46))
pd.polygon([(SX+SWs-int(0.026*W), SY+int(0.014*H)), (SX+SWs-int(0.016*W), SY+int(0.008*H)),
            (SX+SWs-int(0.016*W), SY+int(0.028*H)), (SX+SWs-int(0.026*W), SY+int(0.022*H))],
           fill=(12, 26, 46))

# header pill
HPH = int(0.058*H)
hdr_y = SY + int(0.034*H)
rr(pd, (SX, hdr_y, SX+SWs, hdr_y + HPH), radius=int(HPH//2),
   fill=WHITE, outline=BORDER, width=1*SCALE)
ix, iy = SX + int(0.028*W), hdr_y + HPH//2
isz = int(0.020*W)
rr(pd, (ix - isz//2, iy - isz//4, ix + isz//2, iy + isz//4), radius=int(isz*0.12), fill=CYAN)
rr(pd, (ix - isz//4, iy - isz//2, ix + isz//4, iy + isz//2), radius=int(isz*0.12), fill=CYAN)
txt(pd, ix + isz + int(0.014*W), hdr_y + HPH//2, 'Nursing Science', f_phone_h, SLATE8, anchor='lm')

# streak badge
sbw = int(0.050*W)
sbx1, sbx2 = SX+SWs-sbw-int(0.012*W), SX+SWs-int(0.012*W)
sy_top = hdr_y + HPH//2 - int(0.014*H)
rr(pd, (sbx1, sy_top, sbx2, sy_top + int(0.028*H)), radius=int(0.014*H),
   fill=(255, 247, 237), outline=(254, 215, 170), width=1*SCALE)
pd.ellipse((sbx1+int(0.010*W), sy_top+int(0.004*H), sbx1+int(0.020*W), sy_top+int(0.014*H)),
           fill=AMBER)
txt(pd, sbx2-int(0.006*W), sy_top + int(0.014*H), '7 days', f_phone_sub, ORANGE_D, anchor='rm')

# progress section
PY0 = hdr_y + HPH + int(0.018*H)
txt(pd, SX, PY0, 'Practice Quiz', f_phone_pr, SLATE5)
txt(pd, SX+SWs, PY0, '14 / 40', f_phone_pr, CYAN_D, anchor='ra')
pb_h = int(0.010*H)
rr(pd, (SX, PY0+int(0.016*H), SX+SWs, PY0+int(0.016*H)+pb_h),
   radius=int(pb_h//2), fill=BORDER)
rr(pd, (SX, PY0+int(0.016*H), SX+int(SWs*0.35), PY0+int(0.016*H)+pb_h),
   radius=int(pb_h//2), fill=CYAN)

# question card
QCY = PY0 + int(0.048*H)
QH = int(0.110*H)
rr(pd, (SX, QCY, SX+SWs, QCY+QH), radius=int(0.020*H), fill=WHITE,
   outline=BORDER, width=1*SCALE)
txt(pd, SX + int(0.026*W), QCY + int(0.018*H), 'Which chamber of the', f_phone_q, SLATE8)
txt(pd, SX + int(0.026*W), QCY + int(0.040*H), 'heart pumps oxygenated blood?', f_phone_q, SLATE8)
# options
OP = QCY + QH + int(0.016*H)
OH = int(0.046*H)
OG = int(0.009*H)
opts = [('Right atrium', False), ('Left atrium', False),
        ('Right ventricle', False), ('Left ventricle', True)]
for i, (lab, correct) in enumerate(opts):
    oy = OP + i * (OH + OG)
    if correct:
        rr(pd, (SX, oy, SX+SWs, oy+OH), radius=int(0.018*H), fill=GREEN)
        cxm, cym = SX+int(0.035*W), oy+OH//2
        pd.ellipse((cxm-int(0.012*W), cym-int(0.012*W), cxm+int(0.012*W), cym+int(0.012*W)),
                   fill=WHITE)
        pd.line((cxm-int(0.006*W), cym, cxm-int(0.002*W), cym+int(0.005*H)), fill=GREEN_D, width=int(1.6*SCALE))
        pd.line((cxm-int(0.002*W), cym+int(0.005*H), cxm+int(0.007*W), cym-int(0.005*H)), fill=GREEN_D, width=int(1.6*SCALE))
        txt(pd, SX+int(0.052*W), oy+OH//2, lab, f_phone_o, WHITE, anchor='lm')
    else:
        rr(pd, (SX, oy, SX+SWs, oy+OH), radius=int(0.018*H), fill=WHITE,
           outline=BORDER, width=1*SCALE)
        txt(pd, SX+int(0.024*W), oy+OH//2, 'ABCD'[i] + ')  ' + lab, f_phone_o, SLATE6, anchor='lm')

# bottom stats row
BRY = OP + 4*(OH+OG) + int(0.012*H)
BROW_H = int(0.088*H)
rr(pd, (SX, BRY, SX+SWs, BRY+BROW_H), radius=int(0.022*H), fill=WHITE,
   outline=BORDER, width=1*SCALE)
ring_r = int(0.030*H)
ring_cx = SX + ring_r + int(0.016*W)
ring_cy = BRY + BROW_H//2 + int(0.002*H)
pd.arc((ring_cx-ring_r, ring_cy-ring_r, ring_cx+ring_r, ring_cy+ring_r),
       start=90, end=-90+360*0.86, fill=CYAN, width=int(0.009*W))
pd.arc((ring_cx-ring_r, ring_cy-ring_r, ring_cx+ring_r, ring_cy+ring_r),
       start=90-360*0.86, end=90, fill=BORDER, width=int(0.009*W))
txt(pd, ring_cx, ring_cy-int(0.003*H), '86%', f_ring, SLATE8, anchor='mm')
txt(pd, ring_cx, ring_cy+int(0.017*H), 'PASS RATE', f_phone_ls, SLATE4, anchor='mm')
sx2 = SX + int(0.135*W)
txt(pd, sx2, BRY + int(0.030*H), 'Level 12', f_phone_sub, SLATE8)
txt(pd, sx2, BRY + int(0.052*H), 'Exam Readiness', f_phone_ls, SLATE4)
txt(pd, sx2 + int(0.14*W), BRY + int(0.030*H), '92%', f_phone_sub, GREEN_D)
txt(pd, SX+SWs, BRY + int(0.030*H), '12:34', f_phone_sub, SLATE8, anchor='ra')
txt(pd, SX+SWs, BRY + int(0.052*H), 'time left', f_phone_ls, SLATE4, anchor='ra')

img.alpha_composite(phone)
d = ImageDraw.Draw(img, 'RGBA')

# ---------------- floating 40K+ badge ----------------
br = int(0.056*H)
bcx, bcy = PX+PW + int(0.016*W), PY + int(0.075*H)
fb = Image.new('RGBA', (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(fb, 'RGBA')
bd.ellipse((bcx-br, bcy-br, bcx+br, bcy+br), fill=WHITE)
bd.ellipse((bcx-br, bcy-br, bcx+br, bcy+br), outline=BORDER, width=1*SCALE)
bd.text((bcx, bcy-int(0.004*H)), '40K+', font=f_badge_b, fill=(7, 60, 92), anchor='mm')
bd.text((bcx, bcy+int(0.024*H)), 'MCQs', font=f_badge_s, fill=SLATE5, anchor='mm')
img.alpha_composite(fb)
d = ImageDraw.Draw(img, 'RGBA')

# ---------------- finalize ----------------
img = img.convert('RGB')
img = img.resize((OUT_W, OUT_H), Image.LANCZOS)
out = r'D:\React Native\Nurse Exam Preparation\artifacts\mobile\release\feature-graphic-1024x500.png'
img.save(out, 'PNG')
print('SAVED', out, os.path.getsize(out), 'bytes', img.size)