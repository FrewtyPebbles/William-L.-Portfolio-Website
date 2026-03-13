import OUTPUTS, {TerraformOutputs} from "./terraform_outputs";
import 'dotenv/config'; 

export function is_prod():boolean {
  return process.env.ENVIRONMENT != "dev"
}

export function get_asset_url(file_name:string):string {
  if (is_prod()) {
    return `https://${(OUTPUTS as TerraformOutputs).cdn_domain_name}/static/public/uploads/${file_name}`
  } else {
    return `/public/uploads/${file_name}`
  }
}