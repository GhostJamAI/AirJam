import os
import re


def fix_ts_files():
    current_dir = os.getcwd()
    for filename in os.listdir(current_dir):
        if filename.endswith(".ts"):
            filepath = os.path.join(current_dir, filename)

            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            # Match `var _something =`
            match = re.search(r"\bvar\s+(_[a-zA-Z0-9_]+)\s*=", content)
            if match:
                var_name = match.group(1)

                # Replace that var with const
                content = re.sub(rf"\bvar\s+{re.escape(var_name)}\s*=", f"const {var_name} =", content)

                # Add export if it's not already there
                if f"export default {var_name}" not in content:
                    content += f"\n\nexport default {var_name};\n"

                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)

                print(f"✅ Fixed: {filename}")
            else:
                print(f"⚠️  Skipped (no var match): {filename}")


# Run the script
fix_ts_files()
