import { build_packer } from "./packer_lib.mjs";
import { deploy_terraform } from "./terraform_lib.mjs";

async function main() {
    console.log("\n# RUNNING BUILD PACKER\n");
    await build_packer();
    console.log("\n# RUNNING TERRAFORM COMMANDS\n");
    await deploy_terraform();
}

main()