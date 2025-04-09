import { getPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Gemeinsame Prisma-Instanz verwenden
  const prisma = getPrismaClient();

  const body = await readBody(event);
  const headers = getRequestHeaders(event);
  const ipAddress =
    headers["x-forwarded-for"] ||
    event.node.req.socket.remoteAddress ||
    "unknown";

  console.log("API POST /api/log-click: Anfrage erhalten", {
    buttonText: body.text,
    ipAddress,
  });

  try {
    // Verbindung explizit herstellen
    await prisma.$connect();

    const click = await prisma.buttonClick.create({
      data: {
        buttonText: body.text,
        ipAddress: ipAddress as string,
      },
    });

    console.log("API POST /api/log-click: Klick erfolgreich erstellt", {
      id: click.id,
      buttonText: click.buttonText,
    });

    return { success: true, click };
  } catch (error: unknown) {
    console.error(
      "API POST /api/log-click: Fehler beim Erstellen des Klicks:",
      {
        message: (error as Error)?.message || "Unbekannter Fehler",
        name: (error as Error)?.name,
        code: (error as any)?.code,
        meta: (error as any)?.meta,
        buttonText: body.text,
        ipAddress,
      }
    );

    // Strukturierten Fehler zurückgeben statt { success: false }
    throw createError({
      statusCode: 500,
      statusMessage: `Fehler beim Erstellen des Klicks: ${
        (error as Error)?.message || "Unbekannter Fehler"
      }`,
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
