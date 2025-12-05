import os
from PIL import Image

# Tên file nguồn
SOURCE_IMAGE = "logo.png"

# Thư mục output gốc
OUTPUT_DIR = "output"

# Các kích thước icon chuẩn Android (classic icon, không adaptive)
ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def main():
    # Kiểm tra file nguồn
    if not os.path.exists(SOURCE_IMAGE):
        raise FileNotFoundError(f"Không tìm thấy file {SOURCE_IMAGE}")

    # Tạo thư mục output gốc
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Mở ảnh nguồn
    with Image.open(SOURCE_IMAGE) as img:
        # Đảm bảo có alpha (để giữ nền trong suốt nếu có)
        img = img.convert("RGBA")

        # Nếu ảnh không vuông, có thể scale & crop / pad,
        # ở đây giả sử logo.png đã là 1024x1024 nên resize trực tiếp
        for folder, size in ICON_SIZES.items():
            out_dir = os.path.join(OUTPUT_DIR, folder)
            os.makedirs(out_dir, exist_ok=True)

            # Resize
            resized = img.resize((size, size), Image.LANCZOS)

            # Tên file output
            out_path = os.path.join(out_dir, "ic_launcher.png")
            resized.save(out_path, format="PNG")

            print(f"✅ Đã tạo: {out_path} ({size}x{size})")

    print("\n🎉 Hoàn tất! Tất cả icon nằm trong thư mục 'output/'.")

if __name__ == "__main__":
    main()
