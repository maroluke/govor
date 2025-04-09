import { PrismaClient } from "@prisma/client";

// In Netlify Serverless-Funktionen wird jede Funktion in einer eigenen, isolierten Umgebung ausgeführt.
// Für optimale Performance in der Produktion sollten wir eine Verbindung pro Instanz haben.

// Globale Deklaration für TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | undefined = undefined;

export function getPrismaClient(): PrismaClient {
  // Prüfe auf Serverless-Umgebung oder Entwicklungsumgebung
  const isServerless =
    process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;

  if (isServerless) {
    // In Serverless-Umgebungen - wir verwenden eine neue Instanz für jede Funktion
    // aber versuchen, sie innerhalb einer Funktion wiederzuverwenden
    if (!prismaInstance) {
      console.log(
        "[PRISMA] Initialisiere neue PrismaClient-Instanz für Serverless"
      );
      prismaInstance = new PrismaClient({
        log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
        errorFormat: "minimal",
      });

      // Verbindung vorwärmen für schnellere erste Anfrage
      prismaInstance.$connect().catch((e) => {
        console.error("[PRISMA] Fehler beim Verbindungsaufbau:", e);
      });
    }
    return prismaInstance;
  }

  // In lokaler Entwicklung - global cachen, um Hot Reloading zu unterstützen
  if (global.prismaClient === undefined) {
    console.log(
      "[PRISMA] Initialisiere globale PrismaClient-Instanz für Entwicklung"
    );
    global.prismaClient = new PrismaClient({
      log: ["query", "error", "warn"],
      errorFormat: "pretty",
    });

    // Verbindung vorwärmen für schnellere erste Anfrage
    global.prismaClient.$connect().catch((e) => {
      console.error("[PRISMA] Fehler beim Verbindungsaufbau:", e);
    });
  }

  return global.prismaClient;
}
