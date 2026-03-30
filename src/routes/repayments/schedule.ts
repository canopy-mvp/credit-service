import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function getRepaymentSchedule(req: FastifyRequest, reply: FastifyReply) {
  const { facilityId } = req.params as { facilityId: string };

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { borrower: true },
  });

  if (!facility) {
    return reply.status(404).send({ error: { code: 'FACILITY_NOT_FOUND', message: 'Not found' } });
  }

  const schedule = calculateSchedule(facility.balanceCents, facility.interestRateBps);

  return reply.send({
    facilityId: facility.id,
    borrowerName: facility.borrower.name,
    borrowerEmail: facility.borrower.email,
    borrowerPhone: facility.borrower.phone,
    balance: facility.balanceCents,
    schedule,
  });
}

function calculateSchedule(balanceCents: number, rateBps: number) {
  const monthlyRate = rateBps / 10000 / 12;
  const periods = 12;
  const payment = Math.ceil((balanceCents * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -periods)));

  return Array.from({ length: periods }, (_, i) => ({
    period: i + 1,
    paymentCents: payment,
    principalCents: Math.ceil(payment - balanceCents * monthlyRate),
    interestCents: Math.ceil(balanceCents * monthlyRate),
  }));
}
