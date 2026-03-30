import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

interface CreateFacilityBody {
  borrowerId: string;
  facilityType: 'revolving' | 'term';
  limitCents: number;
  interestRateBps: number;
}

export async function createFacility(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as CreateFacilityBody;

  const facility = await prisma.facility.create({
    data: {
      borrowerId: body.borrowerId,
      facilityType: body.facilityType,
      limitCents: body.limitCents,
      interestRateBps: body.interestRateBps,
      balanceCents: 0,
      status: 'active',
    },
  });

  return reply.status(201).send(facility);
}
