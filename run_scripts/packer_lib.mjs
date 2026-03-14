import { run } from "./lib.mjs";

export function build_packer() {
    console.log("\nBUILDING AMI\n");
    run("docker build -t portfolio .");
    run("docker save portfolio -o ./packer/tmp/portfolio.tar")
    run("packer build ./packer/");
    run("rimraf ./packer/tmp/portfolio.tar");
}