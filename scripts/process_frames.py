from PIL import Image, ImageFilter
import numpy as np
import os

PROC_DIR = r'c:\Users\jayit\OneDrive\바탕 화면\roqkf\acsent woow\scripts\processing'
OUT_DIR = os.path.join(PROC_DIR, 'cleaned')
os.makedirs(OUT_DIR, exist_ok=True)

for i in range(1, 106):
    fname = f'frame_{i:04d}.png'
    img = Image.open(os.path.join(PROC_DIR, fname))
    arr = np.array(img, dtype=np.float32)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3]

    # =====================
    # 1. Remove cursor (frames 1~20)
    # =====================
    if i <= 20:
        # Cursor is white/light on red envelope, center area
        cy_start, cy_end = h // 3, h * 2 // 3
        cx_start, cx_end = w // 4, w * 3 // 4

        region = rgb[cy_start:cy_end, cx_start:cx_end]
        # White pixels in red zone
        is_cursor = (region[:, :, 0] > 200) & (region[:, :, 1] > 200) & (region[:, :, 2] > 200)
        # Also catch cursor border (dark outline on red)
        is_cursor_border = (region[:, :, 0] < 80) & (region[:, :, 1] < 60) & (region[:, :, 2] < 60)

        # Only if small cluster (cursor sized)
        cursor_count = np.sum(is_cursor) + np.sum(is_cursor_border)
        if 5 < cursor_count < 800:
            # Create heavily blurred version for inpainting
            blurred = np.array(img.filter(ImageFilter.GaussianBlur(radius=8)), dtype=np.float32)
            cursor_full = np.zeros((h, w), dtype=bool)
            cursor_full[cy_start:cy_end, cx_start:cx_end] = is_cursor | is_cursor_border

            # Dilate the cursor mask slightly
            from scipy.ndimage import binary_dilation
            cursor_full = binary_dilation(cursor_full, iterations=2)

            for c in range(3):
                arr[:, :, c] = np.where(cursor_full, blurred[:, :, c], arr[:, :, c])

    # =====================
    # 2. Remove text from letter paper (frames 60+)
    # Use heavy blur inpainting approach
    # =====================
    if i >= 60:
        rgb = arr[:, :, :3]

        # Define paper region: upper portion of frame
        paper_top = 0
        paper_bottom = int(h * 0.62)
        paper_left = 10
        paper_right = w - 10

        # Detect paper area (cream/white, excluding envelope red and background beige)
        paper_region = rgb[paper_top:paper_bottom, paper_left:paper_right]

        # Paper is bright and relatively neutral (not red like envelope)
        is_paper = (paper_region[:, :, 0] > 200) & \
                   (paper_region[:, :, 1] > 190) & \
                   (paper_region[:, :, 2] > 180) & \
                   (paper_region[:, :, 0] < 255) & \
                   (paper_region[:, :, 1] - paper_region[:, :, 2] < 30)  # not too warm

        if np.sum(is_paper) > 500:
            # Get average paper color
            paper_pixels = paper_region[is_paper]
            paper_avg = np.mean(paper_pixels, axis=0)

            # Detect text: pixels on paper that are darker than paper
            # Text is dark red/maroon on cream
            brightness = np.mean(paper_region, axis=2)
            is_dark_on_paper = (brightness < np.mean(paper_avg) - 15)

            # Also detect mid-tone text (fading in, partially transparent)
            is_mid_text = (paper_region[:, :, 0] < 210) & \
                          (paper_region[:, :, 1] < 195) & \
                          is_paper  # was detected as paper but slightly off

            # Combine: anything on the paper area that's not clean paper
            # Use color distance from paper average
            color_dist = np.sqrt(np.sum((paper_region - paper_avg) ** 2, axis=2))
            is_text_area = (color_dist > 18) | is_dark_on_paper

            # Only within actual paper bounds (not envelope edges)
            text_mask_region = is_text_area & is_paper

            # Also catch text that's darker than paper threshold
            dark_text = (brightness < 180) & (paper_region[:, :, 1] > 50)
            text_mask_region = text_mask_region | (dark_text & (color_dist > 10))

            text_count = np.sum(text_mask_region)

            if text_count > 100:
                # Create very heavily blurred version for clean paper
                blur_img = img.filter(ImageFilter.GaussianBlur(radius=25))
                blur_arr = np.array(blur_img, dtype=np.float32)

                # Apply blurred paper where text was detected
                full_mask = np.zeros((h, w), dtype=bool)
                full_mask[paper_top:paper_bottom, paper_left:paper_right] = text_mask_region

                # Dilate to catch anti-aliased edges
                from scipy.ndimage import binary_dilation
                full_mask = binary_dilation(full_mask, iterations=3)
                # Keep within paper bounds
                paper_full = np.zeros((h, w), dtype=bool)
                paper_full[paper_top:paper_bottom, paper_left:paper_right] = is_paper
                full_mask = full_mask & paper_full

                for c in range(3):
                    arr[:, :, c] = np.where(full_mask, blur_arr[:, :, c], arr[:, :, c])

    # Save
    out = Image.fromarray(arr.astype(np.uint8))
    out.save(os.path.join(OUT_DIR, fname))

    if i % 20 == 0:
        print(f'Processed {i}/105')

print('Done!')
