import { run } from "./lib.mjs";
import * as fs from 'node:fs';
import { EC2Client, DescribeImagesCommand } from "@aws-sdk/client-ec2";



export async function ami_exists(ami_name, region) {
    console.log("## Checking if AMI Exists");
    const client = new EC2Client({ region });
    try {
        const command = new DescribeImagesCommand({
            Filters: [{ Name: "name", Values: [ami_name] }]
        });

        const response = await client.send(command);

        // If Images array is not empty, the AMI already exists
        if (response.Images && response.Images.length > 0) {
            const amiId = response.Images[0].ImageId;
            console.log("Found %s", amiId);

            return true;
        } else {
            console.log("Could not find an AMI with the specified name.");
            
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

export async function build_packer(check_exists = true) {
    if (check_exists && await ami_exists("AL-portfolio-ami-*", "us-west-1")) {
        console.log("\n\x1b[34m%s\x1b[0m\n", "The AMI already exists, skipping.");
        return;
    }

    console.log("\n## Creating packer/tmp directory\n");
    fs.mkdirSync("./packer/tmp", { recursive: true });
    console.log("\n## Building Docker Image\n");
    run("docker build --platform linux/arm64 -t portfolio .");
    run("docker save portfolio -o ./packer/tmp/portfolio.tar");
    console.log("\n## Building Packer AMI\n");
    run("packer build ./packer/");
    console.log("\n## Cleaning tmp files\n");
    run("rimraf ./packer/tmp/portfolio.tar");

    console.log("\n\x1b[32m%s\x1b[0m\n", "SUCCESSFULLY FINISHED PACKER BUILD");
    
}