import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient();

  try {
    // Verbindung sicherstellen
    await prisma.$connect();

    // Logging für Debugging in Produktion
    console.log("GET /api/clicks: Starte Datenbankabfrage");

    // Alle Button-Klicks abrufen, sortiert nach Zeitstempel (neueste zuerst)
    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    console.log(`GET /api/clicks: ${clicks.length} Klicks gefunden`);

    return clicks;
  } catch (error) {
    console.error(
      "GET /api/clicks: Fehler beim Abrufen der Button-Klicks:",
      error
    );
    return {
      statusCode: 500,
      error: "Datenbankfehler",
      message: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
});
