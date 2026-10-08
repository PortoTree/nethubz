const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const userId = 'a3c75f4c-a622-41b2-8205-e350c51aca63'; // The one from the DB
  const projectId = 'd9fdc168-38a0-4376-a289-24065bb1d6d0'; // The project from DB

  const like = await prisma.like.findFirst({
    where: {
      userId,
      postId: null,
      projectId: projectId,
    }
  });
  console.log("Found like?", !!like, like);
}
main().finally(() => prisma.$disconnect());
