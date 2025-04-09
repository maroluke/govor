import { getPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Gemeinsame Prisma-Instanz verwenden
  const prisma = getPrismaClient();

  console.log("API DELETE /api/clicks: Löschvorgang gestartet");
  try {
    // Versuche zuerst mit prisma.deleteMany()
    try {
      const deleteResult = await prisma.buttonClick.deleteMany({});
      console.log(
        `API DELETE /api/clicks: Erfolgreich ${deleteResult.count} Einträge gelöscht.`
      );
      return { success: true, count: deleteResult.count };
    } catch (primaryError) {
      console.warn(
        "API DELETE /api/clicks: Primäre Löschmethode fehlgeschlagen, versuche direktes SQL",
        {
          message: (primaryError as Error)?.message,
        }
      );

      // Fallback: Verwende direktes SQL (funktioniert oft besser in serverless Umgebungen)
      // WICHTIG: Dies ist sicherer als normale SQL-Injektionen, da keine Benutzereingaben verwendet werden
      const result = await prisma.$executeRawUnsafe(
        'DELETE FROM "ButtonClick";'
      );
      console.log(
        `API DELETE /api/clicks: Erfolgreich ${result} Einträge mit SQL gelöscht.`
      );
      return { success: true, count: result };
    }
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
    // In der gemeinsamen Instanz besser nicht trennen
    // await prisma.$disconnect();
  }
});
