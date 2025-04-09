import { PrismaClient } from "@prisma/client";

// In Netlify Serverless-Funktionen wird jede Funktion in einer eigenen, isolierten Umgebung ausgeführt.
// Für optimale Performance in der Produktion sollten wir eine Verbindung pro Instanz haben.

// Globale Deklaration für TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | undefined = undefined;

/**
 * Liefert eine PrismaClient-Instanz, die für die Netlify-Umgebung optimiert ist
 */
export function getPrismaClient(): PrismaClient {
  // Spezielle Behandlung für Netlify
  if (process.env.NETLIFY) {
    try {
      if (!prismaInstance) {
        console.log(
          "[PRISMA] Initialisiere Prisma-Client für Netlify-Umgebung"
        );
        prismaInstance = new PrismaClient({
          log: ["error"],
          errorFormat: "minimal",
        });

        // Explizit die Verbindung herstellen
        prismaInstance
          .$connect()
          .then(() =>
            console.log("[PRISMA] Verbindung erfolgreich hergestellt")
          )
          .catch((e) => console.error("[PRISMA] Verbindungsfehler:", e));
      }
      return prismaInstance;
    } catch (e) {
      console.error("[PRISMA] Fehler bei der Prisma-Initialisierung:", e);
      // Fallback-Instanz zurückgeben, wenn etwas schief geht
      return new PrismaClient();
    }
  }

  // Für andere Umgebungen (Entwicklung, etc.)
  if (process.env.NODE_ENV === "development") {
    if (global.prismaClient === undefined) {
      console.log(
        "[PRISMA] Initialisiere globale PrismaClient-Instanz für Entwicklung"
      );
      global.prismaClient = new PrismaClient({
        log: ["query", "error", "warn"],
      });
    }
    return global.prismaClient;
  }

  // Fallback für andere Umgebungen
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}
