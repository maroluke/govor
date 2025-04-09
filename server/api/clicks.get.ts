import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Klare Trennung zwischen Fehlertypen
    try {
      // PrismaClient initialisieren
      const prisma = getPrismaClient();

      // In einer Netlify-Umgebung kurz warten, um sicherzustellen, dass die Datenbankverbindung hergestellt werden kann
      if (process.env.NETLIFY) {
        console.log(
          "[API] GET /api/clicks: Netlify-Umgebung erkannt, initialisiere Datenbank"
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Verbindung zuerst prüfen, bevor Abfragen durchgeführt werden
      try {
        await prisma.$connect();
        console.log("[API] GET /api/clicks: Datenbankverbindung hergestellt");
      } catch (connError) {
        console.error(
          "[API] GET /api/clicks: Datenbankverbindungsfehler:",
          connError
        );
        // In Produktion leere Liste zurückgeben
        if (process.env.NODE_ENV === "production") return [];
        throw connError;
      }

      // Abfrage durchführen
      const clicks = await prisma.buttonClick.findMany({
        orderBy: {
          timestamp: "desc",
        },
      });

      console.log(`[API] GET /api/clicks: ${clicks.length} Klicks gefunden`);
      return clicks;
    } catch (dbError) {
      console.error("[API] GET /api/clicks: Datenbankfehler:", dbError);

      // Im Produktionsmodus immer leere Liste zurückgeben, statt zu scheitern
      if (process.env.NODE_ENV === "production") {
        return [];
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Datenbankfehler",
        data: {
          message:
            dbError instanceof Error
              ? dbError.message
              : "Unbekannter Datenbankfehler",
        },
      });
    }
  } catch (generalError) {
    console.error("[API] GET /api/clicks: Unbehandelter Fehler:", generalError);
    // Immer eine leere Liste zurückgeben im Fehlerfall in Produktion
    return [];
  }
});
