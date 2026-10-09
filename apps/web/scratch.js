const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const reactionGroups = await prisma.like.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { type: 'desc' } }
    });
    console.log(reactionGroups);
  } catch (e) {
    console.error(e);
  }
}
main();
