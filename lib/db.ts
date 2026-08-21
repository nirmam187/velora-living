import { PrismaClient } from '@prisma/client'

/**
 * A single PrismaClient for the process. Next's dev server reloads modules on every
 * edit, which would otherwise open a new connection pool each time until the
 * database refuses more, so in development the client is cached on globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
