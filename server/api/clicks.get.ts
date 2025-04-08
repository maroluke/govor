import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  const clicks = await prisma.buttonClick.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });

  return clicks;
});
