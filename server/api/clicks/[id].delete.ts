import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID ist erforderlich",
    });
  }

  await prisma.buttonClick.delete({
    where: { id },
  });

  return { success: true };
});
