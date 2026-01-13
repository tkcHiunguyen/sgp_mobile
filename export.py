import os
import re
from openai import OpenAI

# ================= CONFIG =================
ROOT_DIR = "./"
OUTPUT_FILE = "PROJECT_STRUCTURE_SUMMARY.md"

# 🔥 Loại bỏ hoàn toàn các thư mục React Native không cần thiết
EXCLUDE_FOLDERS = {
    "node_modules",
    "android",
    "ios",
    ".expo",
    ".expo-shared",
    ".gradle",
    "dist",
    "build",
    "web-build",
    "coverage",
    "__tests__",
    "venv",
    "__pycache__",
    ".git",
    ".vscode",
    "logs",
}

OPENAI_MODEL = "gpt-5-nano"


def load_env(path=".env"):
    try:
        with open(path, "r", encoding="utf-8") as f:
            for raw_line in f:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
    except FileNotFoundError:
        return


load_env()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY. Set it in .env or environment variables.")
# ==========================================

client = OpenAI(api_key=OPENAI_API_KEY)


# ======== CLEAN FRONTEND CODE =========
def clean_frontend_code(content: str) -> str:
    """Loại bỏ CSS, comment, style để tránh file HTML/Vue quá dài."""
    content = re.sub(r"<style[\s\S]*?</style>", "", content, flags=re.MULTILINE)
    content = re.sub(r'class="[^"]*"', "", content)
    content = re.sub(r'style="[^"]*"', "", content)
    content = re.sub(r"<!--[\s\S]*?-->", "", content)
    return content.strip()


# ========= PROMPT =========
SUMMARY_PROMPT = """
Hãy phân tích nội dung file sau và tạo bản tóm tắt kỹ thuật dạng bullet point, ghi bằng tiếng Việt.

Yêu cầu:
- Liệt kê các mục chính: functions, hooks, components (nếu là React/React Native), classes (nếu là Python).
- Mỗi mục chỉ mô tả ngắn gọn 1 dòng về nhiệm vụ chính.
- Không mô tả chi tiết nội bộ.
- Không thêm nội dung ngoài file.
- Output chỉ gồm bullet points.
- chức năng chính của file.

Nội dung file:
"""


def summarize_file_with_gpt(file_content: str, file_name: str) -> str:
    prompt = SUMMARY_PROMPT + "\n" + file_content

    try:
        response = client.responses.create(model=OPENAI_MODEL, input=prompt)
        summary = response.output_text.strip()
        print(f"[GPT Summary for {file_name}]:\n{summary}\n")
        return summary

    except Exception as e:
        print(f"[Error summarizing {file_name}]: {e}")
        return f"Could not summarize: {e}"


def walk_dir(path, prefix=""):
    lines = []

    try:
        items = sorted(os.listdir(path))
    except PermissionError:
        return lines

    for idx, item in enumerate(items):
        if item in EXCLUDE_FOLDERS:
            continue

        full_path = os.path.join(path, item)
        connector = "└─ " if idx == len(items) - 1 else "├─ "
        file_name = os.path.basename(full_path)

        # ===== DIRECTORY =====
        if os.path.isdir(full_path):
            lines.append(f"{prefix}{connector}{item}/")

            new_prefix = prefix + ("    " if idx == len(items) - 1 else "│   ")
            lines.extend(walk_dir(full_path, new_prefix))

        # ===== FILE =====
        else:
            lines.append(f"{prefix}{connector}{item}")
            ext = os.path.splitext(item)[1]

            # Chỉ tóm tắt file code
            if ext not in {".py", ".js", ".jsx", ".ts", ".tsx"}:
                continue

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                if len(content.strip()) < 5:
                    print(f"[Skipping empty file] {full_path}")
                    continue

                print(f"\n[Reading file] {full_path} ({len(content)} chars)")

                # Làm sạch file frontend nếu cần
                if ext in {".js", ".jsx", ".tsx"} and len(content) > 6000:
                    print(f"[Cleaning large frontend file] {file_name}")
                    content = clean_frontend_code(content)

                summary = summarize_file_with_gpt(content, file_name)

                for s in summary.splitlines():
                    lines.append(f"{prefix}    - {s}")

            except Exception as e:
                print(f"[Error reading file] {full_path}: {e}")
                lines.append(f"{prefix}    - Could not read file")

    return lines


if __name__ == "__main__":
    print("Generating project structure summary with GPT...\n")

    md_content = ["# Project Structure Summary", ""]
    md_content.extend(walk_dir(ROOT_DIR))

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(md_content))

    print(f"\nMarkdown summary generated: {OUTPUT_FILE}")
