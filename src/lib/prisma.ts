import "dotenv/config";
import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import OUTPUTS, { TerraformOutputs } from "./terraform_outputs";

// You only pass the URL; the adapter creates the 'better-sqlite3' instance for you

const pool = new Pool({ connectionString: (OUTPUTS as TerraformOutputs).database_url })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma