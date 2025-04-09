import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient();

  try {
    // Verbindung sicherstellen
    await prisma.$connect();

    const body = await readBody(event);
    const buttonText = body.buttonText || "Unbekannt";
    const ipAddress = getRequestIP(event) || "0.0.0.0";

    console.log(`POST /api/log-click: Speichere Klick für "${buttonText}"`);

    // Button-Klick in der Datenbank speichern
    const click = await prisma.buttonClick.create({
      data: {
        buttonText,
        ipAddress,
        timestamp: new Date(),
      },
    });

    console.log(`POST /api/log-click: Klick gespeichert mit ID ${click.id}`);

    return {
      success: true,
      data: click,
    };
  } catch (error) {
    console.error(
      "POST /api/log-click: Fehler beim Speichern des Button-Klicks:",
      error
    );
    return {
      success: false,
      error: "Datenbankfehler",
      message: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
});
