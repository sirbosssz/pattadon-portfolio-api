import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const profile = await prisma.profile.create({
    data: {
      authId: 'test-uid',
      email: 'test@example.com',
      fullname: 'Test User',
    },
  })

  return { profile }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
