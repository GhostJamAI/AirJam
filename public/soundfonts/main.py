import os
import re


def process_js_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    variable_name = None

    for line in lines:
        match = re.match(r"\s*var\s+(_tone_\d+_[A-Za-z0-9_]+)\s*=", line)
        if match:
            variable_name = match.group(1)
            line = line.replace("var", "const", 1)
        new_lines.append(line)

    if variable_name:
        # Avoid duplicating export if it already exists
        if not any("export default" in line for line in new_lines):
            new_lines.append(f"\nexport default {variable_name};\n")

        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"✅ Processed: {filepath}")
    else:
        print(f"⚠️ Skipped (no variable match): {filepath}")


def clean_directory(path):
    for root, _, files in os.walk(path):
        for file in files:
            full_path = os.path.join(root, file)

            if file.endswith(".js"):
                process_js_file(full_path)
            elif file.endswith(".html"):
                os.remove(full_path)
                print(f"🗑️ Deleted: {full_path}")


if __name__ == "__main__":
    clean_directory(".")  # Scan from current directory
    print("✅ All done.")
