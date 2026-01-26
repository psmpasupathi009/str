import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma client (skip during build)
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  throw new Error(
    'DATABASE_URL is not set in environment variables. Please add it to your .env file.'
  )
}

// Check for common connection string issues
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl.includes(' ') && !dbUrl.includes('%20')) {
    console.warn('⚠️  WARNING: DATABASE_URL contains spaces. Make sure to URL encode them or remove them.')
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
