import { execSync } from "child_process";

export function run(command, ignoreError = false) {
  try {
    return execSync(command, { stdio: ignoreError ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!ignoreError) {
      console.error(`Command failed: ${command}`);
      process.exit(1);
    }
  }
}