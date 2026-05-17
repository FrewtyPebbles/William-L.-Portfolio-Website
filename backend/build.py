import subprocess
import shutil
import zipfile
import os
import sys
from pathlib import Path

def build_backend():
    root = Path(__file__).parent

    vendor_dir = root / ".vendor"
    stage_dir = root / ".stage"
    zip_path = root / "lambda.zip"
    app_dir = root / "app"
    req_txt = root / "requirements.txt"

    print("\n> pip install -r requirements.txt -t .vendor/ (Linux x86_64 wheels)")
    subprocess.run([
        sys.executable, "-m", "pip", "install",
        "-r", str(req_txt),
        "-t", str(vendor_dir),
        "--upgrade",
        "--platform", "manylinux2014_x86_64",
        "--python-version", "3.12",
        "--only-binary=:all:",
    ], cwd=root, check=True)

    if zip_path.exists():
        zip_path.unlink()
    if stage_dir.exists():
        shutil.rmtree(stage_dir)

    print("\n> Staging files")
    shutil.copytree(app_dir, stage_dir / "app")

    for entry in vendor_dir.iterdir():
        if entry.name.startswith("."):
            continue
        dest = stage_dir / entry.name
        if entry.is_dir():
            shutil.copytree(entry, dest)
        else:
            shutil.copy2(entry, dest)

    print("\n> Creating lambda.zip")
    skip_dirs = {"__pycache__", ".pytest_cache", "bin"}

    with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_STORED) as z:
        for dirpath, dirnames, filenames in os.walk(str(stage_dir)):
            dirnames[:] = [d for d in dirnames if d not in skip_dirs]
            for f in filenames:
                if f.endswith(".pyc"):
                    continue
                fp = os.path.join(dirpath, f)
                arcname = os.path.relpath(fp, str(stage_dir))
                z.write(fp, arcname)

    shutil.rmtree(stage_dir)
    print("Created lambda.zip")
