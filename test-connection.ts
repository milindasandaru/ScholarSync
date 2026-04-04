import { PrismaClient } from '@prisma/client';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }

    await prisma.$connect();

    const health = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    const userCount = await prisma.user.count();

    const isHealthy = Array.isArray(health) && health.length > 0 && health[0]?.ok === 1;

    if (!isHealthy) {
      throw new Error('Database health query returned an unexpected result.');
    }

    console.log(`\x1b[32m✅ Database connection successful!\x1b[0m`);
    console.log(`Connected to PostgreSQL and verified with SELECT 1.`);
    console.log(`Current users in database: ${userCount}`);
  } catch (error) {
    console.error('\x1b[31m❌ Database connection failed.\x1b[0m');
    if (error instanceof Error) {
      console.error(`Message: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
