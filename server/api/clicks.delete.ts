import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient();

  try {
    // Verbindung sicherstellen
    await prisma.$connect();

    console.log("DELETE /api/clicks: Lösche alle Klicks");

    // Alle Button-Klicks löschen
    const deletedCount = await prisma.buttonClick.deleteMany({});

    console.log(`DELETE /api/clicks: ${deletedCount.count} Klicks gelöscht`);

    return {
      success: true,
      message: `${deletedCount.count} Klicks wurden gelöscht`,
    };
  } catch (error) {
    console.error(
      "DELETE /api/clicks: Fehler beim Löschen der Button-Klicks:",
      error
    );
    return {
      success: false,
      error: "Datenbankfehler",
      message: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
});
