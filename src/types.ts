export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'banking' | 'credit_card' | 'e_wallet';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  receiptImage?: string; // Base64 or URL Locket-style photo
  createdAt: string;
}

export interface Budget {
  category: string;
  limit: number;
  month: string;
  spent?: number;
  remaining?: number;
  percent?: number;
  isOver?: boolean;
}

export interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
}

export interface DailyStat {
  day: number;
  dateStr: string;
  income: number;
  expense: number;
}

export interface MonthStats {
  month: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
    transactionCount: number;
  };
  categories: CategorySummary[];
  dailyStats: DailyStat[];
}

export interface AIClassifyResult {
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  reasoning: string;
  source: string;
}

export interface QueueMessage {
  id: string;
  queue: 'transaction-exchange' | 'budget-evaluation-queue' | 'notification-queue';
  event: string;
  payload: any;
  timestamp: string;
  status: 'published' | 'processing' | 'acknowledged' | 'alert_dispatched';
  workerLog?: string;
}

export interface QueueResponse {
  success: boolean;
  count: number;
  architecture: {
    type: string;
    exchanges: string[];
    queues: string[];
    workers: string[];
  };
  data: QueueMessage[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  input: any;
  expected: string;
  status: 'PASSED' | 'FAILED';
  executionTimeMs: number;
}

export interface TestSuiteResponse {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    timestamp: string;
  };
  tests: TestCaseResult[];
}
