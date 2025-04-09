import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const prisma = getPrismaClient();

    try {
      // Verbindung sicherstellen mit Timeout
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout")), 5000)
      );

      // Entweder die Verbindung oder der Timeout wird zuerst abgeschlossen
      await Promise.race([connectPromise, timeoutPromise]);

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
    } catch (dbError) {
      // Detailliertere Fehlerprotokollierung
      console.error(
        "GET /api/clicks: Fehler beim Abrufen der Button-Klicks:",
        dbError
      );
      console.error("Error details:", {
        name: dbError instanceof Error ? dbError.name : "Unknown",
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : "No stack trace",
      });

      // Im Fehlerfall leere Liste zurückgeben statt 500
      console.log(
        "GET /api/clicks: Gebe leere Liste zurück wegen Datenbankfehler"
      );
      return [];
    }
  } catch (error) {
    // Fallback für unerwartete Fehler
    console.error("GET /api/clicks: Unerwarteter Fehler:", error);
    return [];
  }
});
