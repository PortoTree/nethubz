const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const likes = await prisma.like.findMany();
  console.log('Total likes:', likes.length);
  console.log(likes);
}
main().finally(() => prisma.$disconnect());
