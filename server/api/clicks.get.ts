import { getPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Gemeinsame Prisma-Instanz verwenden
  const prisma = getPrismaClient();

  try {
    console.log(
      "API GET /api/clicks: Verbindung zur Datenbank wird hergestellt..."
    );

    // Zusätzliche Verbindungsprüfung
    await prisma.$connect();
    console.log("API GET /api/clicks: Verbindung zur Datenbank hergestellt");

    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    console.log(`API GET /api/clicks: ${clicks.length} Klicks gefunden`);
    return clicks;
  } catch (error: unknown) {
    console.error("API GET /api/clicks: Fehler beim Abrufen der Klicks:", {
      message: (error as Error)?.message || "Unbekannter Fehler",
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });

    // Strukturierter Fehler für besseres Debugging
    throw createError({
      statusCode: 500,
      statusMessage: `Datenbankfehler: ${
        (error as Error)?.message || "Unbekannter Fehler"
      }`,
      data: {
        errorCode: (error as any)?.code,
        errorMeta: (error as any)?.meta,
      },
    });
  } finally {
    // In der gemeinsamen Instanz besser nicht trennen
    // await prisma.$disconnect();
  }
});
