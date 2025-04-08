import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const headers = getRequestHeaders(event);
  const ipAddress =
    headers["x-forwarded-for"] ||
    event.node.req.socket.remoteAddress ||
    "unknown";

  try {
    const click = await prisma.buttonClick.create({
      data: {
        buttonText: body.text,
        ipAddress: ipAddress as string,
      },
    });
    return { success: true, click };
  } catch (error) {
    console.error("Fehler beim Erstellen des Klicks:", error);
    return { success: false, error };
  }
});
