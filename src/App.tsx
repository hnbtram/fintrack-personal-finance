import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PieChart,
  ListOrdered,
  ShieldAlert,
  Plus,
  RefreshCw,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar as CalendarIcon,
  Camera,
  Heart,
} from 'lucide-react';
import { Header } from './Header';
import { OverviewCards } from './OverviewCards';
import { AIQuickEntry } from './AIQuickEntry';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';
import { CalendarView } from './CalendarView';
import { LocketGalleryView } from './LocketGalleryView';
import { PhotoDetailModal } from './PhotoDetailModal';
import { ChartsView } from './ChartsView';
import { BudgetView } from './BudgetView';
import { QueueMonitorModal } from './QueueMonitorModal';
import { DefenseHubModal } from './DefenseHubModal';
import { api } from './services/api';
import { Transaction, Budget, MonthStats, TransactionType, PaymentMethod } from '../types';

export default function App() {
  const getCurrentMonthStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr());
  const [activeTab, setActiveTab] = useState<'transactions' | 'calendar' | 'locket' | 'charts' | 'budgets'>('transactions');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<MonthStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedPhotoTx, setSelectedPhotoTx] = useState<Transaction | null>(null);
  const [aiPrefill, setAiPrefill] = useState<{
    amount: number;
    type: TransactionType;
    category: string;
    note: string;
  } | null>(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async (monthStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const [txList, budgetList, statsData] = await Promise.all([
        api.getTransactions({ month: monthStr }),
        api.getBudgets(monthStr),
        api.getStats(monthStr),
      ]);

      setTransactions(txList);
      setBudgets(budgetList);
      setStats(statsData);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentMonth);
  }, [currentMonth, loadData]);

  const handleSaveTransaction = async (txData: {
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    note: string;
    paymentMethod: PaymentMethod;
  }) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, txData);
      showToast('Cập nhật giao dịch thành công!', 'success');
    } else {
      await api.createTransaction(txData);
      showToast(
        txData.type === 'income' ? 'Đã thêm thu nhập mới!' : 'Đã ghi chép chi tiêu mới!',
        'success'
      );
      if (txData.type === 'income') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
    }
    setEditingTransaction(null);
    setAiPrefill(null);
    await loadData(currentMonth);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      showToast('Đã xóa giao dịch thành công!', 'info');
      await loadData(currentMonth);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa giao dịch', 'error');
    }
  };

  const handleUpdateBudget = async (category: string, limit: number) => {
    try {
      await api.setBudget(category, limit, currentMonth);
      showToast(`Đã cập nhật hạn mức ${category}!`, 'success');
      await loadData(currentMonth);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu hạn mức', 'error');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Bạn có chắc muốn khôi phục lại dữ liệu mẫu ban đầu cho buổi báo cáo không?')) {
      try {
        await api.resetDemoData();
        showToast('Đã khôi phục dữ liệu mẫu thành công!', 'success');
        await loadData(currentMonth);
      } catch (err: any) {
        showToast(err.message || 'Lỗi khi khôi phục dữ liệu', 'error');
      }
    }
  };

  const overBudgetsCount = budgets.filter((b) => b.isOver).length;

  return (
    <div className="app-shell min-h-screen text-slate-800">
      {toast && (
        <div className="fixed right-5 top-5 z-50 animate-[pulse_0.5s_ease-in-out_1]">
          <div
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-bold shadow-[0_18px_40px_-18px_rgba(15,23,42,0.6)] ${
              toast.type === 'success'
                ? 'border-emerald-500 bg-emerald-600 text-white'
                : toast.type === 'warning'
                  ? 'border-amber-400 bg-amber-500 text-slate-900'
                  : toast.type === 'error'
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-slate-700 bg-slate-800 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {toast.type === 'info' && <Info className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <Header
        currentMonth={currentMonth}
        onMonthChange={(m) => setCurrentMonth(m)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setAiPrefill(null);
          setIsAddModalOpen(true);
        }}
        onOpenAIQuick={() => {
          const el = document.getElementById('ai-quick-entry-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onResetData={handleResetData}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm">
            <span>{error}</span>
            <button onClick={() => loadData(currentMonth)} className="rounded-xl bg-rose-600 px-2.5 py-1.5 text-white transition hover:bg-rose-700">
              Thử lại
            </button>
          </div>
        )}

        <OverviewCards
          totalIncome={stats?.summary.totalIncome || 0}
          totalExpense={stats?.summary.totalExpense || 0}
          netSavings={stats?.summary.netSavings || 0}
          savingsRate={stats?.summary.savingsRate || 0}
          budgets={budgets}
          onOpenBudgets={() => setActiveTab('budgets')}
        />

        <div id="ai-quick-entry-section">
          <AIQuickEntry
            onSuccessTransactionCreated={() => {
              showToast('AI đã tự động lưu giao dịch thành công!', 'success');
              loadData(currentMonth);
            }}
            onOpenWithPrefill={(prefill) => {
              setEditingTransaction(null);
              setAiPrefill(prefill);
              setIsAddModalOpen(true);
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white/70 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur-sm">
          <div className="flex min-w-max items-center gap-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`tab-button ${activeTab === 'transactions' ? 'active rounded-2xl bg-emerald-600 text-white shadow-sm' : 'rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900'} inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold sm:text-sm`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Giao dịch ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`tab-button ${activeTab === 'calendar' ? 'active rounded-2xl bg-emerald-600 text-white shadow-sm' : 'rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900'} inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold sm:text-sm`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Lịch Chi tiêu</span>
            </button>

            <button
              onClick={() => setActiveTab('locket')}
              className={`tab-button ${activeTab === 'locket' ? 'active rounded-2xl bg-amber-500 text-white shadow-sm' : 'rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900'} inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold sm:text-sm`}
            >
              <Camera className="h-4 w-4" />
              <span>Ảnh Locket ({transactions.filter((t) => !!t.receiptImage).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`tab-button ${activeTab === 'charts' ? 'active rounded-2xl bg-emerald-600 text-white shadow-sm' : 'rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900'} inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold sm:text-sm`}
            >
              <PieChart className="h-4 w-4" />
              <span>Biểu đồ Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`tab-button ${activeTab === 'budgets' ? 'active rounded-2xl bg-emerald-600 text-white shadow-sm' : 'rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900'} inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold sm:text-sm`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Ngân sách & Hạn mức</span>
              {overBudgetsCount > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />}
            </button>

            <button
              onClick={() => loadData(currentMonth)}
              disabled={loading}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setAiPrefill(null);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setAiPrefill(null);
                setIsAddModalOpen(true);
              }}
              onOpenPhotoModal={(tx) => setSelectedPhotoTx(tx)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              currentMonth={currentMonth}
              transactions={transactions}
              onSelectDateToAdd={(dateStr) => {
                setEditingTransaction(null);
                setAiPrefill({
                  amount: 0,
                  type: 'expense',
                  category: 'Ăn uống',
                  note: '',
                });
                setIsAddModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setAiPrefill(null);
                setIsAddModalOpen(true);
              }}
              onOpenPhotoModal={(tx) => setSelectedPhotoTx(tx)}
            />
          )}

          {activeTab === 'locket' && (
            <LocketGalleryView
              transactions={transactions}
              onOpenPhotoModal={(tx) => setSelectedPhotoTx(tx)}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setAiPrefill(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'charts' && <ChartsView stats={stats} currentMonth={currentMonth} />}

          {activeTab === 'budgets' && (
            <BudgetView budgets={budgets} currentMonth={currentMonth} onUpdateBudget={handleUpdateBudget} />
          )}
        </div>
      </main>

      <footer className="mt-10 border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p className="font-medium">
            FinTrack © 2026 • Đồ án Quản lý Chi tiêu Cá nhân • Lập trình Web Nâng cao
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => setIsDefenseModalOpen(true)} className="transition hover:text-emerald-600">
              Tài liệu Báo cáo 15 Phút
            </button>
            <span>•</span>
            <button onClick={() => setIsQueueModalOpen(true)} className="transition hover:text-emerald-600">
              Event-Driven Architecture
            </button>
          </div>
        </div>
      </footer>

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
          setAiPrefill(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        prefill={aiPrefill}
      />

      <QueueMonitorModal isOpen={isQueueModalOpen} onClose={() => setIsQueueModalOpen(false)} />

      <DefenseHubModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        onRunValidationDemo={() => {
          setEditingTransaction(null);
          setAiPrefill(null);
          setIsAddModalOpen(true);
        }}
      />

      <PhotoDetailModal
        transaction={selectedPhotoTx}
        onClose={() => setSelectedPhotoTx(null)}
        onEdit={(tx) => {
          setEditingTransaction(tx);
          setAiPrefill(null);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}
