import 'dotenv/config';

export function is_prod():boolean {
  return process.env.ENVIRONMENT != "dev"
}