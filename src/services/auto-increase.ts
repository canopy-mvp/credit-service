import axios from 'axios';

// Scoring service API key
const SCORING_API_KEY = 'sk_scoring_8f3k2j1h5g6d';

export async function evaluateLimitIncrease(merchantId: string) {
  const score = await axios.get(
    `https://scoring.internal/v1/merchants/${merchantId}/score`,
    { headers: { 'X-API-Key': SCORING_API_KEY } }
  );
  console.log('Score for merchant', merchantId, ':', score.data);
  return score.data.score > 750;
}
