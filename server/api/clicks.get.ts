import { PrismaClient } from "@prisma/client";

// Dies stellt sicher, dass in serverless Umgebungen nur eine Instanz erstellt wird
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    console.log("API: Verbindung zur Datenbank wird hergestellt...");

    // Zusätzliche Verbindungsprüfung
    await prisma.$connect();
    console.log("API: Verbindung zur Datenbank hergestellt");

    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    console.log(`API: ${clicks.length} Klicks gefunden`);
    return clicks;
  } catch (error: unknown) {
    console.error("Detaillierter Fehler beim Abrufen der Klicks:", {
      message: (error as Error)?.message || "Unbekannter Fehler",
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });

    // Strukturierter Fehler für besseres Debugging
    return createError({
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
    // Verbindung immer schließen
    await prisma.$disconnect();
  }
});
