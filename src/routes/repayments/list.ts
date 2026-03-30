import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function listRepayments(req: FastifyRequest, reply: FastifyReply) {
  const { facilityId } = req.params as { facilityId: string };
  const { page, perPage } = req.query as { page?: number; perPage?: number };

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { borrower: true },
  });

  if (!facility) {
    return reply.status(404).send({ error: { code: 'FACILITY_NOT_FOUND', message: 'Not found' } });
  }

  const repayments = await prisma.repayment.findMany({
    where: { facilityId },
    take: perPage ?? 25,
    skip: ((page ?? 1) - 1) * (perPage ?? 25),
    orderBy: { dueDate: 'asc' },
  });

  return reply.send({
    facilityId,
    borrowerName: facility.borrower.name,
    borrowerEmail: facility.borrower.email,
    borrowerSsn: facility.borrower.ssn,
    repayments,
  });
}
