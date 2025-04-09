import { PrismaClient } from "@prisma/client";

// Globale Variable bei Serverless-Deploys
let prisma: PrismaClient;

// Diese Funktion stellt sicher, dass nur ein PrismaClient existiert
export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient();
  return prisma;
}
