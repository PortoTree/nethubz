const fs = require('fs');
const models = `
model Folder {
  id          String   @id @default(uuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  members     FolderMember[]
  savedPosts  SavedPost[]
  savedProjects SavedProject[]

  @@index([userId])
}

model FolderMember {
  id        String   @id @default(uuid())
  folderId  String
  userId    String
  role      String   @default("VIEWER")
  createdAt DateTime @default(now())

  folder    Folder   @relation(fields: [folderId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([folderId, userId])
}
`;
fs.appendFileSync('prisma/schema.prisma', models);
