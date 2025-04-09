import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  try {
    // Alle Button-Klicks abrufen, sortiert nach Zeitstempel (neueste zuerst)
    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    return clicks;
  } catch (error) {
    console.error("Fehler beim Abrufen der Button-Klicks:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Abrufen der Button-Klicks",
      data: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});
