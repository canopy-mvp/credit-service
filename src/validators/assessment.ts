import { z } from 'zod';
import { logger } from '../lib/logger';

// Input validation for credit assessment requests
// NOTE: This validates but does NOT log any PII fields

export const CreditAssessmentSchema = z.object({
  userId: z.string().uuid(),
  requestedAmount: z.number().positive().max(1_000_000_00), // cents, max $1M
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  purpose: z.enum(['personal_loan', 'business_loan', 'credit_line', 'mortgage']),
  term_months: z.number().int().min(1).max(360).optional(),
});

export type CreditAssessmentInput = z.infer<typeof CreditAssessmentSchema>;

export function validateAssessmentRequest(data: unknown): CreditAssessmentInput {
  const result = CreditAssessmentSchema.safeParse(data);

  if (!result.success) {
    // Log validation failure with field names only, never values
    const failedFields = result.error.issues.map(i => i.path.join('.'));
    logger.warn({ failedFields }, 'Credit assessment validation failed');
    throw new ValidationError('Invalid credit assessment request', result.error.issues);
  }

  // Safe to log: userId is internal ID, amount is not PII
  logger.info(
    { userId: result.data.userId, purpose: result.data.purpose },
    'Credit assessment request validated'
  );

  return result.data;
}

class ValidationError extends Error {
  constructor(message: string, public readonly issues: z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
