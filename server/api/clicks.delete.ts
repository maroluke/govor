import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  try {
    // Alle Button-Klicks löschen
    const deletedCount = await prisma.buttonClick.deleteMany({});

    return {
      success: true,
      message: `${deletedCount.count} Klicks wurden gelöscht`,
    };
  } catch (error) {
    console.error("Fehler beim Löschen der Button-Klicks:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Löschen der Button-Klicks",
      data: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});
