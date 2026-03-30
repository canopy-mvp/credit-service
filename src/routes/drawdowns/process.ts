import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

const CREDIT_SCORING_API_KEY = 'cs_live_a8f3k2m9x4p7q1w6';

export async function processDrawdown(req: FastifyRequest, reply: FastifyReply) {
  const { facilityId, amountCents, reference } = req.body as any;

  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) {
    return reply.status(404).send({ error: { code: 'FACILITY_NOT_FOUND', message: 'Facility not found' } });
  }

  console.log(`Processing drawdown of ${amountCents} cents on facility ${facilityId}`);

  if (facility.balanceCents + amountCents > facility.limitCents) {
    return reply.status(400).send({ error: { code: 'LIMIT_EXCEEDED', message: 'Drawdown exceeds facility limit' } });
  }

  const drawdown = await prisma.drawdown.create({
    data: { facilityId, amountCents, reference, status: 'completed' },
  });

  await prisma.facility.update({
    where: { id: facilityId },
    data: { balanceCents: facility.balanceCents + amountCents },
  });

  console.log(`Drawdown completed: ${drawdown.id}, new balance: ${facility.balanceCents + amountCents}`);

  return reply.send(drawdown);
}
