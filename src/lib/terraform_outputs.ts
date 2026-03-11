import { execSync } from 'child_process';

export interface TerraformOutputs {
    alb_dns_name:string
    alb_zone_id:string
    alb_arn:string
    https_listener_arn:string
    static_content_bucket_name:string
    database_url:string
    s3_region:string
    cdn_domain_name:string
}

function getTerraformOutputs():TerraformOutputs | {} {
  try {
    // Run the command and capture the output buffer
    const output = execSync('terraform -chdir=terraform output -json').toString();
    const parsed = JSON.parse(output);
    
    // Return a flattened object for easier use
    return Object.keys(parsed).reduce((acc:{[key:string]:any}, key) => {
      acc[key] = parsed[key].value;
      return acc;
    }, {});
  } catch (error:unknown) {
    if (error instanceof Error) {
        console.error("Could not fetch Terraform outputs:", error.message);
    }
    return {};
  }
}

const OUTPUTS:TerraformOutputs | {} = getTerraformOutputs();
export default OUTPUTS;