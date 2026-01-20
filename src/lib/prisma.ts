import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(process.cwd(), "database", 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })

declare global {
  var prisma: PrismaClient | undefined
}

export default prisma =
  global.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
