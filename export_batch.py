"""
export_batch.py
Tự động xuất PNG + AI cho từng Member_ID trong members/exportbatch.txt
Yêu cầu: Live Server đang chạy tại http://127.0.0.1:5500
Chạy:  python export_batch.py
"""

import os, time, shutil, glob
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ── CẤU HÌNH ────────────────────────────────────────────────────
BASE_URL      = "http://127.0.0.1:5500/m.html?c="
BATCH_FILE    = r"D:\DNQT\web-dnqt\members\exportbatch.txt"
DOWNLOADS_DIR = r"C:\Users\DELL\Downloads"
MEMBERS_DIR   = r"D:\DNQT\web-dnqt\members"
PRINT_DIR     = r"D:\DNQT\web-dnqt\members\Print"

WAIT_PAGE_LOAD   = 35   # giây chờ trang + dữ liệu load
WAIT_AFTER_PNG   = 20   # giây chờ file PNG tải xong
WAIT_AFTER_AI    = 20   # giây chờ file AI tải xong
WAIT_BETWEEN_IDS = 5    # giây nghỉ giữa 2 thành viên
# ────────────────────────────────────────────────────────────────


def read_batch():
    with open(BATCH_FILE, encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]


def find_print_folder(member_id):
    """Tìm thư mục Print/Member_ID* (prefix match)."""
    pattern = os.path.join(PRINT_DIR, member_id + "*")
    matches = glob.glob(pattern)
    return matches[0] if matches else None


def wait_for_file(pattern, timeout=30):
    """Chờ đến khi file khớp pattern xuất hiện trong DOWNLOADS_DIR."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        files = glob.glob(os.path.join(DOWNLOADS_DIR, pattern))
        # Loại bỏ file .crdownload (đang tải)
        files = [f for f in files if not f.endswith(".crdownload")]
        if files:
            return files[0]
        time.sleep(1)
    return None


def move_file(src, dst_dir, rename=None):
    os.makedirs(dst_dir, exist_ok=True)
    dst_name = rename if rename else os.path.basename(src)
    dst = os.path.join(dst_dir, dst_name)
    shutil.copy2(src, dst)
    os.remove(src)
    print(f"  → {dst}")


def setup_driver():
    opts = Options()
    # Đặt thư mục download về Downloads cố định
    prefs = {
        "download.default_directory": DOWNLOADS_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    opts.add_experimental_option("prefs", prefs)
    opts.add_argument("--start-maximized")
    # Bỏ dòng dưới nếu muốn thấy trình duyệt:
    # opts.add_argument("--headless=new")
    driver = webdriver.Chrome(options=opts)
    return driver


def export_member(driver, member_id):
    print(f"\n{'='*50}")
    print(f"  Member: {member_id}")
    print(f"{'='*50}")

    url = BASE_URL + member_id
    driver.get(url)
    print(f"  Mở: {url}")
    print(f"  Chờ {WAIT_PAGE_LOAD}s để trang load...")
    time.sleep(WAIT_PAGE_LOAD)

    # ── Bấm Tải PNG ──
    try:
        btn_png = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.ID, "btn-png"))
        )
        btn_png.click()
        print(f"  ✓ Đã bấm Tải PNG, chờ {WAIT_AFTER_PNG}s...")
        time.sleep(WAIT_AFTER_PNG)
    except Exception as e:
        print(f"  ✗ Lỗi bấm PNG: {e}")

    # ── Bấm Tải AI ──
    try:
        btn_ai = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.ID, "btn-ai"))
        )
        btn_ai.click()
        print(f"  ✓ Đã bấm Tải AI, chờ {WAIT_AFTER_AI}s...")
        time.sleep(WAIT_AFTER_AI)
    except Exception as e:
        print(f"  ✗ Lỗi bấm AI: {e}")

    # ── Chờ và kiểm tra 4 file ──
    expected = {
        f"{member_id}-front.png": {"copy_members": True,  "copy_print": True},
        f"{member_id}-back.png":  {"copy_members": True,  "copy_print": True},
        f"{member_id}-front.ai":  {"copy_members": False, "copy_print": True},
        f"{member_id}-back.ai":   {"copy_members": False, "copy_print": True},
    }

    print_folder = find_print_folder(member_id)
    if not print_folder:
        print(f"  ⚠ Không tìm thấy thư mục Print/{member_id}* — tạo mới.")
        print_folder = os.path.join(PRINT_DIR, member_id)
        os.makedirs(print_folder, exist_ok=True)

    for filename, opts in expected.items():
        src = wait_for_file(filename, timeout=30)
        if src:
            print(f"  Tìm thấy: {filename}")
            if opts["copy_members"]:
                move_file(src, MEMBERS_DIR)
                # move_file xóa src, copy_print cần từ members
                # Nên copy sang members trước, rồi copy_print từ members
                src = os.path.join(MEMBERS_DIR, filename)
            if opts["copy_print"]:
                shutil.copy2(src, print_folder)
                print(f"  → Print: {os.path.join(print_folder, filename)}")
        else:
            print(f"  ✗ Không tìm thấy file: {filename} (timeout)")


def main():
    ids = read_batch()
    if not ids:
        print("exportbatch.txt trống hoặc không tìm thấy.")
        return

    print(f"Batch gồm {len(ids)} member(s): {ids}")
    driver = setup_driver()

    try:
        for i, mid in enumerate(ids, 1):
            print(f"\n[{i}/{len(ids)}]")
            export_member(driver, mid)
            if i < len(ids):
                print(f"  Nghỉ {WAIT_BETWEEN_IDS}s trước member tiếp theo...")
                time.sleep(WAIT_BETWEEN_IDS)
    finally:
        driver.quit()
        print("\n✓ Hoàn tất batch export.")


if __name__ == "__main__":
    main()
