export interface CreditLine {
  id: string;
  merchantId: string;
  limit: number;
  balance: number;
  status: 'active' | 'frozen' | 'closed';
}
