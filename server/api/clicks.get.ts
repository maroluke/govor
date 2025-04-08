import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });
    return clicks;
  } catch (error) {
    console.error("Fehler beim Abrufen der Klicks:", error);
    throw createError({
      statusCode: 500,
      message: "Fehler beim Abrufen der Klick-Daten",
      cause: error,
    });
  }
});
