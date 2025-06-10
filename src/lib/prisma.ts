// This file is deprecated - The PrismaClient is now managed inside the PrismaDatabase class
// This file is kept for backward compatibility but will be removed in a future update

import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
let prismaInstance: PrismaClient | undefined;

export const prisma = (() => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
})();

// Deprecated: Use the Database interface instead
console.warn(
  "Using deprecated prisma.ts - Consider migrating to the Database interface"
);
