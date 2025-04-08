import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    // Initialisiere die Datenbank, falls sie nicht existiert
    await prisma.$connect();

    const clicks = await prisma.buttonClick.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });
    return clicks;
  } catch (error) {
    console.error("Fehler beim Abrufen der Klicks:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
});
