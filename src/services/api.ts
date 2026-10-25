import {
  Transaction,
  Budget,
  MonthStats,
  AIClassifyResult,
  QueueResponse,
  TestSuiteResponse,
} from '../types';

export const api = {
  // 1. Get transactions with filters
  async getTransactions(params?: {
    month?: string;
    category?: string;
    type?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/transactions?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tải danh sách giao dịch');
    return data.data;
  },

  // 2. Create transaction
  async createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<{
    transaction: Transaction;
    errors?: Record<string, string>;
  }> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Lỗi khi tạo giao dịch') as any;
      err.errors = data.errors;
      throw err;
    }
    return { transaction: data.data };
  },

  // 3. Update transaction
  async updateTransaction(
    id: string,
    tx: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Lỗi khi cập nhật giao dịch') as any;
      err.errors = data.errors;
      throw err;
    }
    return data.data;
  },

  // 4. Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi xóa giao dịch');
  },

  // 5. Get budgets
  async getBudgets(month?: string): Promise<Budget[]> {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`/api/budgets${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tải ngân sách');
    return data.data;
  },

  // 6. Set/Update budget limit
  async setBudget(category: string, limit: number, month?: string): Promise<void> {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, limit, month }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi lưu ngân sách');
  },

  // 7. Get monthly stats
  async getStats(month?: string): Promise<MonthStats> {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`/api/stats${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tải dữ liệu thống kê');
    return data;
  },

  // 8. AI Classify
  async classifyAI(text: string): Promise<AIClassifyResult> {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi gọi AI phân loại');
    return data.data;
  },

  // 9. Get queue events
  async getQueueLogs(): Promise<QueueResponse> {
    const res = await fetch('/api/queue');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tải hàng đợi');
    return data;
  },

  // 10. Reset demo data
  async resetDemoData(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi khôi phục dữ liệu mẫu');
  },

  // 11. Run automated test suite
  async runTests(): Promise<TestSuiteResponse> {
    const res = await fetch('/api/test/run');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi chạy kiểm thử');
    return data;
  },
};
