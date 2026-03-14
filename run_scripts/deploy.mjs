import { run } from "./lib.mjs";
import { build_packer } from "./packer_lib.mjs";

console.log("\nBUILDING AMI\n");
build_packer();
console.log("\nRUNNING TERRAFORM\n");
run("terraform -chdir=terraform apply");