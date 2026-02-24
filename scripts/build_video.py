from PIL import Image
import os
import shutil

PROC_DIR = r'c:\Users\jayit\OneDrive\바탕 화면\roqkf\acsent woow\scripts\processing'
OUT_DIR = os.path.join(PROC_DIR, 'final_frames')
if os.path.exists(OUT_DIR):
    shutil.rmtree(OUT_DIR)
os.makedirs(OUT_DIR)

# Target: 60fps output
# Structure:
#   1) Static closed envelope: 0.4s = 24 frames (use frame 30)
#   2) Opening motion: frames 43-72, slowed to 1.2s = 72 frames at 60fps
#      Source: 30 frames -> need 72 frames -> ~2.4x slowdown
#   3) Hold on open state: 0.3s = 18 frames (use frame 72)
# Total: ~1.9s, 114 frames

frame_num = 1

# === Part 1: Static closed envelope (0.4s = 24 frames) ===
static_frame = Image.open(os.path.join(PROC_DIR, 'frame_0030.png'))
for _ in range(24):
    static_frame.save(os.path.join(OUT_DIR, f'frame_{frame_num:04d}.png'))
    frame_num += 1
print(f'Part 1 (static): 24 frames')

# === Part 2: Opening motion (frames 43-72, stretched to 72 frames) ===
# Load source motion frames
motion_frames = []
for i in range(43, 73):  # 30 source frames
    img = Image.open(os.path.join(PROC_DIR, f'frame_{i:04d}.png'))
    motion_frames.append(img)

# Map 72 output frames to 30 source frames (linear interpolation)
num_source = len(motion_frames)  # 30
num_target = 72

for t in range(num_target):
    # Map target frame index to source frame position
    src_pos = t * (num_source - 1) / (num_target - 1)
    src_idx = int(src_pos)
    frac = src_pos - src_idx

    if frac < 0.01 or src_idx >= num_source - 1:
        # Use exact source frame
        out_img = motion_frames[min(src_idx, num_source - 1)]
    else:
        # Blend between two adjacent source frames
        import numpy as np
        img1 = np.array(motion_frames[src_idx], dtype=np.float32)
        img2 = np.array(motion_frames[src_idx + 1], dtype=np.float32)
        blended = img1 * (1 - frac) + img2 * frac
        out_img = Image.fromarray(blended.astype(np.uint8))

    out_img.save(os.path.join(OUT_DIR, f'frame_{frame_num:04d}.png'))
    frame_num += 1

print(f'Part 2 (motion): 72 frames from {num_source} source frames')

# === Part 3: Hold on open state (0.3s = 18 frames) ===
hold_frame = motion_frames[-1]  # frame 72 (open with blank paper)
for _ in range(18):
    hold_frame.save(os.path.join(OUT_DIR, f'frame_{frame_num:04d}.png'))
    frame_num += 1
print(f'Part 3 (hold): 18 frames')

total = frame_num - 1
print(f'Total: {total} frames at 60fps = {total/60:.2f}s')
