import "dotenv/config";
import { ContributionLevel, PrismaClient, ProjectProgress, ProjectSubImage } from '@/generated/prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { promises as fs } from 'fs';
import path from 'path';

// You only pass the URL; the adapter creates the 'better-sqlite3' instance for you
const dbPath = path.resolve(process.cwd(), "database", 'dev.db')
const adapter = new PrismaBetterSqlite3({ 
  url: `file:${dbPath}` as string
})

const prisma = new PrismaClient({ adapter })

export default prisma