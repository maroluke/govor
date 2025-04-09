import { PrismaClient } from "@prisma/client";

// PrismaClient ist an den Node.js-Prozess angehängt, wenn in Entwicklung
// oder als Variable, wenn in Produktion
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

// Verhindern mehrerer Instanzen des Prisma Client in Entwicklung
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    // In Produktion - neuer Client, wenn keiner existiert
    return new PrismaClient({
      log: ["error"],
    });
  } else {
    // In Entwicklung - globaler Cache
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient({
        log: ["query", "error", "warn"],
      });
    }
    return global.cachedPrisma;
  }
}
