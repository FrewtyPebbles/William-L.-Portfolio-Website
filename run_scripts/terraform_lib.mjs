import { run } from "./lib.mjs";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function continue_prompt(rl) {
    return (await rl.question('continue?(y/n):')).toLowerCase() === "y"
}

export async function deploy_terraform() {
    const rl = readline.createInterface({ input, output });
    console.log("\n## Initializing terraform\n");
    run("terraform -chdir=terraform init");
    if (!(await continue_prompt(rl))) return
    console.log("\n## Validating terraform\n");
    run("terraform -chdir=terraform validate");
    if (!(await continue_prompt(rl))) return
    console.log("\n## Planning terraform\n");
    run("terraform -chdir=terraform plan -out=tfplan");
    if (!(await continue_prompt(rl))) return
    console.log("\n## Applying terraform\n");
    run("terraform -chdir=terraform apply tfplan");

    console.log("\n\x1b[32m%s\x1b[0m\n", "SUCCESSFULLY DEPLOYED TERRAFORM CONFIG");
}