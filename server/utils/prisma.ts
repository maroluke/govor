import { PrismaClient } from "@prisma/client";

// In Netlify Serverless-Funktionen wird jede Funktion in einer eigenen, isolierten Umgebung ausgeführt.
// Für optimale Performance in der Produktion sollten wir eine Verbindung pro Instanz haben.

// Globale Deklaration für TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient {
  // Prüfe auf Serverless-Umgebung oder Entwicklungsumgebung
  const isServerless =
    process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;

  if (isServerless) {
    // In Serverless-Umgebungen - neue Instanz erstellen, wenn nötig
    return new PrismaClient({
      log: ["error"],
      errorFormat: "minimal",
    });
  }

  // In lokaler Entwicklung - global cachen, um Hot Reloading zu unterstützen
  if (!global.prismaClient) {
    global.prismaClient = new PrismaClient({
      log: ["query", "error", "warn"],
      errorFormat: "pretty",
    });
  }

  return global.prismaClient;
}
