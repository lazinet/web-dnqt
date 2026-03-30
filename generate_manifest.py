"""
generate_manifest.py
Quét thư mục ảnh/video và tạo manifest.json cho slider
Chạy: python generate_manifest.py
"""

import os, json, sys

# ── CẤU HÌNH ────────────────────────────────────────────
POST_DIR     = os.path.join(os.path.dirname(__file__),
               'assets', 'background', '260321_tannien', 'post')
OUTPUT_FILE  = os.path.join(POST_DIR, 'manifest.json')

IMAGE_EXTS   = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}
VIDEO_EXTS   = {'.mp4', '.webm', '.mov'}
# ────────────────────────────────────────────────────────

def main():
    if not os.path.isdir(POST_DIR):
        print(f'Không tìm thấy thư mục: {POST_DIR}')
        sys.exit(1)

    images, videos = [], []

    for fname in sorted(os.listdir(POST_DIR)):
        if fname == 'manifest.json':
            continue
        ext = os.path.splitext(fname)[1].lower()
        if ext in IMAGE_EXTS:
            images.append(fname)
        elif ext in VIDEO_EXTS:
            videos.append(fname)

    # Ảnh trước, video sau
    files = [{'name': f, 'type': 'image'} for f in images] + \
            [{'name': f, 'type': 'video'} for f in videos]

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as fp:
        json.dump(files, fp, ensure_ascii=False, indent=2)

    print(f'OK manifest.json -- {len(images)} anh, {len(videos)} video')
    for f in files:
        print(f"  [{f['type']:5}] {f['name']}")

if __name__ == '__main__':
    main()
