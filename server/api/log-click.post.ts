import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  try {
    const body = await readBody(event);
    const buttonText = body.buttonText || "Unbekannt";
    const ipAddress = getRequestIP(event) || "0.0.0.0";

    // Button-Klick in der Datenbank speichern
    const click = await prisma.buttonClick.create({
      data: {
        buttonText,
        ipAddress,
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      data: click,
    };
  } catch (error) {
    console.error("Fehler beim Speichern des Button-Klicks:", error);
    return {
      success: false,
      error: "Fehler beim Speichern des Button-Klicks",
    };
  } finally {
    await prisma.$disconnect();
  }
});
