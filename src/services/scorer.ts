import { getSecret } from '../lib/secrets';
import { logger } from '../lib/logger';
import { CreditFactors, CreditScore } from '../types';
import { TransactionRepository } from '../repositories/transaction.repo';

// Risk weights for credit scoring model
const WEIGHTS = {
  paymentHistory: 0.35,
  creditUtilization: 0.30,
  accountAge: 0.15,
  transactionVolume: 0.10,
  diversification: 0.10,
};

export class CreditScorer {
  constructor(private readonly txnRepo: TransactionRepository) {}

  async calculateScore(userId: string): Promise<CreditScore> {
    const factors = await this.gatherFactors(userId);
    const rawScore = this.computeRawScore(factors);
    const normalizedScore = Math.round(Math.max(300, Math.min(850, rawScore)));

    logger.info({ userId, score: normalizedScore }, 'Credit score calculated');

    return {
      userId,
      score: normalizedScore,
      factors,
      calculatedAt: new Date().toISOString(),
      model: 'novapay-v2',
    };
  }

  private async gatherFactors(userId: string): Promise<CreditFactors> {
    const [history, utilization, accountAge, volume] = await Promise.all([
      this.txnRepo.getPaymentHistory(userId, 24), // 24 months
      this.txnRepo.getCreditUtilization(userId),
      this.txnRepo.getAccountAge(userId),
      this.txnRepo.getTransactionVolume(userId, 12), // 12 months
    ]);

    return {
      paymentHistory: history.onTimeRate,
      creditUtilization: utilization.ratio,
      accountAgeMonths: accountAge.months,
      monthlyTransactionVolume: volume.avgMonthly,
      productDiversification: volume.uniqueProducts,
    };
  }

  private computeRawScore(factors: CreditFactors): number {
    const paymentScore = factors.paymentHistory * 850;
    const utilizationScore = (1 - Math.min(factors.creditUtilization, 1)) * 850;
    const ageScore = Math.min(factors.accountAgeMonths / 120, 1) * 850;
    const volumeScore = Math.min(factors.monthlyTransactionVolume / 100, 1) * 850;
    const diversityScore = Math.min(factors.productDiversification / 5, 1) * 850;

    return (
      paymentScore * WEIGHTS.paymentHistory +
      utilizationScore * WEIGHTS.creditUtilization +
      ageScore * WEIGHTS.accountAge +
      volumeScore * WEIGHTS.transactionVolume +
      diversityScore * WEIGHTS.diversification
    );
  }
}
