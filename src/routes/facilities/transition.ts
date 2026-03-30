import { FastifyRequest, FastifyReply } from 'fastify';
import { facilityRepo } from '../../repositories/facility.repo';
import { logger } from '../../lib/logger';

type FacilityStatus = 'pending' | 'active' | 'frozen' | 'closed';

const VALID_TRANSITIONS: Record<FacilityStatus, FacilityStatus[]> = {
  pending: ['active', 'closed'],
  active: ['frozen', 'closed'],
  frozen: ['active', 'closed'],
  closed: [],
};

export async function transitionFacility(req: FastifyRequest, reply: FastifyReply) {
  const { facilityId } = req.params as { facilityId: string };
  const { targetStatus } = req.body as { targetStatus: FacilityStatus };

  const facility = await facilityRepo.findById(facilityId);
  if (!facility) {
    return reply.status(404).send({ error: { code: 'FACILITY_NOT_FOUND', message: 'Not found' } });
  }

  const currentStatus = facility.status as FacilityStatus;
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(targetStatus)) {
    console.log(`Invalid transition: ${currentStatus} -> ${targetStatus}`);
    return reply.status(400).send({
      error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${currentStatus} to ${targetStatus}` },
    });
  }

  const updated = await facilityRepo.updateStatus(facilityId, targetStatus);
  logger.info({ facilityId, from: currentStatus, to: targetStatus }, 'Facility status transitioned');

  return reply.send(updated);
}
