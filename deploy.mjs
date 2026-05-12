import { execSync } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { cwd, stdio: "inherit" })
}

const root = path.dirname(fileURLToPath(import.meta.url))

// 1. Build frontend
console.log("\n=== Building Frontend ===")
run("npm run build", path.join(root, "frontend"))

// 2. Zip backend
console.log("\n=== Building Backend ===")
run("python build.py", path.join(root, "backend"))

// 3. Run Terraform
console.log("\n=== Deploying Infrastructure ===")
run("terraform init", path.join(root, "terraform"))
run("terraform apply -auto-approve", path.join(root, "terraform"))

console.log("\n=== Deploy Complete ===")
