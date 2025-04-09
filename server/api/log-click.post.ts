import { getPrismaClient } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Gemeinsame Prisma-Instanz verwenden
  const prisma = getPrismaClient();

  const body = await readBody(event);
  if (!body || !body.text) {
    console.error(
      "API POST /api/log-click: Fehler - Kein gültiger Request-Body"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Fehler: Kein gültiger Button-Text übermittelt",
    });
  }

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
    try {
      await prisma.$connect();
    } catch (connError) {
      console.warn(
        "API POST /api/log-click: Verbindungsfehler, versuche trotzdem",
        {
          message: (connError as Error)?.message,
        }
      );
      // Weiter ohne explizite Verbindung, Prisma versucht automatisch
    }

    // Versuche, den Klick mit normaler API zu erstellen
    try {
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
    } catch (primaryError) {
      console.warn(
        "API POST /api/log-click: Primäre Erstellungsmethode fehlgeschlagen, versuche direktes SQL",
        {
          message: (primaryError as Error)?.message,
        }
      );

      // Fallback: Verwende direktes SQL
      const now = new Date().toISOString();
      const result = await prisma.$executeRawUnsafe(
        'INSERT INTO "ButtonClick" ("buttonText", "ipAddress", "timestamp") VALUES ($1, $2, $3) RETURNING *',
        body.text,
        ipAddress,
        now
      );

      console.log(
        "API POST /api/log-click: Klick erfolgreich mit SQL erstellt"
      );
      return { success: true };
    }
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

    // Strukturierten Fehler zurückgeben
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
  }
});
