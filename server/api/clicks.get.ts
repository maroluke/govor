import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const prisma = getPrismaClient();

    try {
      // Logging für Debugging
      console.log("[API] GET /api/clicks: Starte Datenbankabfrage");
      console.log(
        "[API] Datenbankverbindung:",
        process.env.DATABASE_URL?.substring(0, 25) + "..."
      );

      // Verbindung sicherstellen mit Timeout
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Database connection timeout")),
          10000
        )
      );

      // Entweder die Verbindung oder der Timeout wird zuerst abgeschlossen
      await Promise.race([connectPromise, timeoutPromise]);

      // Alle Button-Klicks abrufen, sortiert nach Zeitstempel (neueste zuerst)
      const clicks = await prisma.buttonClick.findMany({
        orderBy: {
          timestamp: "desc",
        },
      });

      console.log(`[API] GET /api/clicks: ${clicks.length} Klicks gefunden`);

      return clicks;
    } catch (dbError) {
      // Detailliertere Fehlerprotokollierung
      console.error("[API] GET /api/clicks: Datenbankfehler:", dbError);

      if (process.env.NODE_ENV === "production") {
        // In Produktion leere Liste zurückgeben, statt Fehler zu werfen
        return [];
      } else {
        // In Entwicklung für besseres Debugging Fehlerdetails zurückgeben
        throw createError({
          statusCode: 500,
          statusMessage: "Datenbankfehler",
          data: {
            message:
              dbError instanceof Error
                ? dbError.message
                : "Unbekannter Datenbankfehler",
            name: dbError instanceof Error ? dbError.name : "UnknownError",
          },
        });
      }
    } finally {
      // In Serverless-Umgebungen ist es wichtig, die Verbindung zu schließen
      if (process.env.NETLIFY) {
        try {
          await prisma.$disconnect();
        } catch (e) {
          console.error(
            "[API] Fehler beim Trennen der Datenbankverbindung:",
            e
          );
        }
      }
    }
  } catch (error) {
    // Fallback für unerwartete Fehler
    console.error("[API] GET /api/clicks: Unerwarteter Fehler:", error);
    return [];
  }
});
