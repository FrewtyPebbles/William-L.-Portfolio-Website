import subprocess
from pathlib import Path
from backend.build import build_backend
from ssg.projects import generate_projects
from ssg.resumes import generate_resumes

def run(cmd, cwd):
    print(f"\n> {cmd}")
    subprocess.run(cmd, cwd=cwd, shell=True, check=True)

# Root directory (same directory as this script)
root = Path(__file__).resolve().parent

print("\n=== Generating SSG Projects Config ===")
generate_projects()

print("\n=== Generating SSG Resumes Config ===")
generate_projects()

# 1. Build frontend
print("\n=== Building Frontend ===")
run("npm run build", root / "frontend")

# 2. Zip backend
print("\n=== Building Backend ===")
build_backend()

# 3. Run Terraform
print("\n=== Deploying Infrastructure ===")
terraform_dir = root / "terraform"

run("terraform init", terraform_dir)
run("terraform apply -auto-approve", terraform_dir)

print("\n=== Deploy Complete ===")