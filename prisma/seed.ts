import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.positions.createMany({
    data: [
      { name: 'Fullstack Developer/Software Engineer' },
      { name: 'Senior Developer' },
      { name: 'Technical Lead' },
      { name: 'Product Manager' },
    ],
  })

  return { success: true }
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
