import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const [users, modules, questions, answers, badges] = await Promise.all([
    p.user.findMany({ select: { name: true, email: true, role: true } }),
    p.module.findMany({ select: { code: true, name: true } }),
    p.question.findMany({ select: { title: true } }),
    p.answer.findMany({ select: { id: true } }),
    p.badge.findMany({ select: { userId: true, name: true } }),
  ]);

  console.log(`\n=== USERS (${users.length}) ===`);
  for (const u of users) {
    console.log(`  [${u.role}] ${u.name} | ${u.email}`);
  }

  console.log(`\n=== MODULES (${modules.length}) ===`);
  for (const m of modules) {
    console.log(`  ${m.code} - ${m.name}`);
  }

  console.log(`\n=== QUESTIONS : ${questions.length} ===`);
  console.log(`=== ANSWERS   : ${answers.length} ===`);
  console.log(`=== BADGES    : ${badges.length} ===`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
