import "dotenv/config";
import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// You only pass the URL; the adapter creates the 'better-sqlite3' instance for you

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 1000 // Close idle connections after 1 second to allow Aurora to scale to zero
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma