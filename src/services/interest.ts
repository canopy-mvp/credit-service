import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function calculateDailyInterest() {
  const lines = await prisma.creditLine.findMany({ where: { status: 'active', balance: { gt: 0 } } });
  for (const line of lines) {
    const dailyRate = 0.15 / 365; // 15% APR
    const interest = line.balance * dailyRate;
    console.log(`Credit line ${line.id}: balance=${line.balance}, interest=${interest.toFixed(2)}`);
    await prisma.interestAccrual.create({
      data: { creditLineId: line.id, amount: Math.round(interest), date: new Date() },
    });
  }
}
