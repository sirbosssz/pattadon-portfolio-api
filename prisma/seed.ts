import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.positions.deleteMany()
  await prisma.profiles.deleteMany()
  await prisma.profileLookingForPositions.deleteMany()

  await prisma.positions.createMany({
    data: [
      { name: 'Fullstack Developer/Software Engineer' },
      { name: 'Senior Developer' },
      { name: 'Technical Lead' },
      { name: 'Product Manager' },
    ],
  })
  const lookingForPositions = await prisma.positions.findMany({
    where: {
      name: { in: ['Senior Developer', 'Technical Lead', 'Product Manager'] },
    },
  })

  await prisma.profiles.create({
    data: {
      authId: 'GW4jUD0kAMXFICUmDPIxKlhh4Ka2',
      email: 'pattadonb8@gmail.com',
      fullname: 'Pattadon Baongern',
      introduction: '',
      currentPosition: {
        connect: { name: 'Fullstack Developer/Software Engineer' },
      },
      lookingForPositions: {
        createMany: {
          data: lookingForPositions.map((position) => ({
            positionId: position.id,
          })),
        },
      },
    },
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
