import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function runUnderwriting(req: FastifyRequest, reply: FastifyReply) {
  const { borrowerId, requestedAmountCents } = req.body as any;

  try {
    const borrower = await prisma.borrower.findUnique({ where: { id: borrowerId } });
    if (!borrower) {
      throw new Error(`Borrower ${borrowerId} not found`);
    }

    const creditScore = await prisma.creditCheck.findFirst({
      where: { borrowerId },
      orderBy: { createdAt: 'desc' },
    });

    const decision = creditScore && creditScore.score >= 650 ? 'approved' : 'declined';
    const approvedAmountCents = decision === 'approved'
      ? Math.min(requestedAmountCents, creditScore!.score * 1000)
      : 0;

    return reply.send({ borrowerId, decision, approvedAmountCents, creditScore: creditScore?.score });
  } catch (err) {
    return reply.status(500).send({ message: (err as Error).message, stack: (err as Error).stack });
  }
}
