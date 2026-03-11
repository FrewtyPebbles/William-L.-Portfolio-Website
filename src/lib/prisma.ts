import "dotenv/config";
import { ContributionLevel, PrismaClient, ProjectProgress, ProjectSubImage } from '@/generated/prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { is_prod } from "@/lib/utils";
import OUTPUTS, { TerraformOutputs } from "./terraform_outputs";

// You only pass the URL; the adapter creates the 'better-sqlite3' instance for you
let prisma: PrismaClient

if (is_prod()) {
  // Production: Aurora PostgreSQL
  const pool = new Pool({ connectionString: (OUTPUTS as TerraformOutputs).database_url })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
} else {
  const dbPath = path.resolve(process.cwd(), "database", 'dev.db')
  const adapter = new PrismaBetterSqlite3({ 
    url: `file:${dbPath}` as string
  })
  
  prisma = new PrismaClient({ adapter })
}

export default prisma