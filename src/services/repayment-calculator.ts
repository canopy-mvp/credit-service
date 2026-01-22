export function calculateRepaymentSchedule(principal: number, rate: number, months: number) {
  const monthlyRate = rate / 12;
  const payment = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));
  return { monthlyPayment: Math.round(payment), totalPayment: Math.round(payment * months) };
}
