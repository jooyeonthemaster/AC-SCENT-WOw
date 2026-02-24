from PIL import Image
import numpy as np
from scipy.ndimage import binary_dilation

# Load ORIGINAL image (not the already-processed one)
img = Image.open(r'c:\Users\jayit\OneDrive\바탕 화면\roqkf\acsent woow\public\images\back ground.png')
arr = np.array(img, dtype=np.float32)
h, w = arr.shape[:2]
print(f'Image: {w}x{h}')

# ============================================
# STEP 1: Replace rainbow colors with green
# ============================================
text_end = int(h * 0.12)  # Extended to 12%
region = arr[:text_end].copy()
rgb = region[:, :, :3]

# Sample background from corners
corner = 80
corners = np.concatenate([
    rgb[:corner, :corner].reshape(-1, 3),
    rgb[:corner, -corner:].reshape(-1, 3),
])
bg_mean = np.mean(corners, axis=0)
print(f'Background: RGB({bg_mean[0]:.0f},{bg_mean[1]:.0f},{bg_mean[2]:.0f})')

# HSV-like analysis
r_n, g_n, b_n = rgb[:,:,0]/255, rgb[:,:,1]/255, rgb[:,:,2]/255
cmax = np.maximum(np.maximum(r_n, g_n), b_n)
cmin = np.minimum(np.minimum(r_n, g_n), b_n)
delta = cmax - cmin
sat = np.where(cmax > 0, delta / cmax, 0)
val = cmax

bg_dist = np.sqrt(np.sum((rgb - bg_mean) ** 2, axis=2))

# Detect rainbow fill pixels (colored, not background)
is_rainbow = (sat > 0.12) & (val > 0.25) & (bg_dist > 25)
# Detect dark outlines
is_outline = (val < 0.45) & (bg_dist > 35)
# Combined text mask
is_text = is_rainbow | is_outline

# Also catch any remaining colored pixels by checking R or B dominance
r_dom = (rgb[:,:,0] > rgb[:,:,1] + 15) & (bg_dist > 20)
b_dom = (rgb[:,:,2] > rgb[:,:,1] + 15) & (bg_dist > 20)
is_colored_remnant = (r_dom | b_dom) & (~is_text)
is_text = is_text | is_colored_remnant

print(f'Text pixels: {np.sum(is_text)}')

# Luminance for green mapping
lum = 0.299 * rgb[:,:,0] + 0.587 * rgb[:,:,1] + 0.114 * rgb[:,:,2]
lum_norm = np.clip(lum / 255.0, 0, 1)

# Target green shades
dark_green = np.array([20, 48, 28])
light_green = np.array([55, 118, 62])

# Apply green to all text pixels
for c in range(3):
    new_val = dark_green[c] + (light_green[c] - dark_green[c]) * lum_norm
    region[:,:,c] = np.where(is_text, new_val, region[:,:,c])

# Anti-aliasing blend
edge_mask = (~is_text) & (bg_dist > 12) & (bg_dist <= 25)
blend_factor = np.clip((bg_dist - 12) / 13.0, 0, 1)
for c in range(3):
    new_val = dark_green[c] + (light_green[c] - dark_green[c]) * lum_norm
    blended = region[:,:,c] * (1 - blend_factor) + new_val * blend_factor
    region[:,:,c] = np.where(edge_mask, blended, region[:,:,c])

arr[:text_end] = region

# ============================================
# STEP 2: Add white outline/shadow effect
# ============================================
print('Adding white outline...')

# Re-detect text in the now-green region
region_green = arr[:text_end].copy()
rgb_g = region_green[:,:,:3]
bg_dist_g = np.sqrt(np.sum((rgb_g - bg_mean) ** 2, axis=2))

# Text mask on green version (the green text pixels)
text_mask = bg_dist_g > 20

# Dilate (expand) the text mask to create outline area
# Use a circular structuring element for smooth outline
radius = 18  # pixels of outline width
y_grid, x_grid = np.ogrid[-radius:radius+1, -radius:radius+1]
struct = (x_grid**2 + y_grid**2) <= radius**2

dilated = binary_dilation(text_mask, structure=struct)

# Outline zone = dilated area minus original text
outline_zone = dilated & (~text_mask)

# Also create a soft edge for the outline (gradient from white to transparent)
# Dilate further for the soft edge
soft_radius = 25
y_grid2, x_grid2 = np.ogrid[-soft_radius:soft_radius+1, -soft_radius:soft_radius+1]
struct_soft = (x_grid2**2 + y_grid2**2) <= soft_radius**2
dilated_soft = binary_dilation(text_mask, structure=struct_soft)
soft_zone = dilated_soft & (~dilated) & (~text_mask)

# Apply white to outline zone
white = np.array([255, 255, 255])
for c in range(3):
    region_green[:,:,c] = np.where(outline_zone, white[c], region_green[:,:,c])

# Soft blend for outer edge
from scipy.ndimage import distance_transform_edt
# Calculate distance from text for blending
dist_from_text = distance_transform_edt(~text_mask)
# In the soft zone, blend white based on distance
soft_blend = np.clip(1.0 - (dist_from_text - radius) / (soft_radius - radius), 0, 1)
for c in range(3):
    blended = region_green[:,:,c] * (1 - soft_blend) + white[c] * soft_blend
    region_green[:,:,c] = np.where(soft_zone, blended, region_green[:,:,c])

arr[:text_end] = region_green

# ============================================
# STEP 3: Save
# ============================================
output = Image.fromarray(arr.astype(np.uint8))
out_path = r'c:\Users\jayit\OneDrive\바탕 화면\roqkf\acsent woow\public\images\back ground_green.png'
output.save(out_path)
print(f'Done! Saved: back ground_green.png')
