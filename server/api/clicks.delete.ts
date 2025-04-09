import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log("API DELETE /api/clicks: Löschvorgang gestartet");
  try {
    const deleteResult = await prisma.buttonClick.deleteMany({});
    console.log(
      `API DELETE /api/clicks: Erfolgreich ${deleteResult.count} Einträge gelöscht.`
    );
    return { success: true, count: deleteResult.count };
  } catch (error: unknown) {
    console.error("API DELETE /api/clicks: Fehler beim Löschen der Klicks:", {
      message: (error as Error)?.message || "Unbekannter Fehler",
      name: (error as Error)?.name,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Fehler beim Löschen der Klicks: ${
        (error as Error)?.message || "Unbekannter Fehler"
      } `,
      data: {
        errorCode: (error as any)?.code,
        errorMeta: (error as any)?.meta,
      },
    });
  } finally {
    // Verbindung sicher schließen
    await prisma.$disconnect();
  }
});
