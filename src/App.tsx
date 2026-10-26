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
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { AIQuickEntry } from './components/AIQuickEntry';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { CalendarView } from './components/CalendarView';
import { LocketGalleryView } from './components/LocketGalleryView';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { ChartsView } from './components/ChartsView';
import { BudgetView } from './components/BudgetView';
import { QueueMonitorModal } from './components/QueueMonitorModal';
import { DefenseHubModal } from './components/DefenseHubModal';
import { AuthModal } from './components/AuthModal';
import { WelcomePage } from './components/WelcomePage';
import { api } from './services/api';
import { AuthUser, authStore, AUTH_REQUIRED_EVENT } from './services/auth';
import { Transaction, Budget, MonthStats, TransactionType, PaymentMethod } from './types';

export default function App() {
  const getCurrentMonthStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr());
  const [activeTab, setActiveTab] = useState<'transactions' | 'calendar' | 'locket' | 'charts' | 'budgets'>('transactions');

  // Core Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<MonthStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Popups
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

  // Auth State
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Toast Notification
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

  // Khôi phục phiên đăng nhập khi mở lại trang (kiểm tra token còn hạn không)
  useEffect(() => {
    api.me().then((u) => setUser(u));
  }, []);

  const openAuth = (mode: 'login' | 'register', message: string | null = null) => {
    setAuthMode(mode);
    setAuthMessage(message);
    setIsAuthOpen(true);
  };

  // Server trả 401 (token hết hạn / chưa đăng nhập) -> yêu cầu đăng nhập lại
  useEffect(() => {
    const onAuthRequired = () => {
      setUser(null);
      openAuth('login', 'Vui lòng đăng nhập để tạo hoặc chỉnh sửa giao dịch.');
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
  }, []);

  // Chặn mở form giao dịch khi chưa đăng nhập (áp dụng cho mọi nút: Giao dịch mới, Sửa, Lịch, Locket...)
  useEffect(() => {
    if (isAddModalOpen && !user) {
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      setAiPrefill(null);
      openAuth('login', 'Bạn cần đăng nhập để tạo giao dịch.');
    }
  }, [isAddModalOpen, user]);

  const handleAuthSuccess = (u: AuthUser) => {
    setUser(u);
    setIsAuthOpen(false);
    setAuthMessage(null);
    showToast(`Xin chào ${u.name}!`, 'success');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    showToast('Đã đăng xuất.', 'info');
  };

  // Fetch all data for current month
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

      // Check for overbudget alert
      const over = budgetList.filter((b) => b.isOver);
      if (over.length > 0) {
        // Trigger subtle warning toast if just loaded
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData(currentMonth);
  }, [currentMonth, loadData, user]);

  // Handle saving transaction (Create or Update)
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

  // Handle delete
  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      showToast('Đã xóa giao dịch thành công!', 'info');
      await loadData(currentMonth);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa giao dịch', 'error');
    }
  };

  // Handle budget limit update
  const handleUpdateBudget = async (category: string, limit: number) => {
    try {
      await api.setBudget(category, limit, currentMonth);
      showToast(`Đã cập nhật hạn mức ${category}!`, 'success');
      await loadData(currentMonth);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu hạn mức', 'error');
    }
  };

  // Handle reset data
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

  // Chưa đăng nhập: hiện trang chào mừng, bấm nút mới mở form đăng nhập/đăng ký
  if (!user) {
    return (
      <>
        <WelcomePage
          onLogin={() => openAuth('login')}
          onRegister={() => openAuth('register')}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          message={authMessage}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Count active budget alerts for badge in header
  const overBudgetsCount = budgets.filter((b) => b.isOver).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'warning'
                  ? 'bg-amber-500 text-slate-900 border-amber-400'
                  : toast.type === 'error'
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-white border-slate-700'
              }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
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
        user={user}
        onLogin={() => openAuth('login')}
        onRegister={() => openAuth('register')}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Error notification if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadData(currentMonth)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* 1. Overview Metric Cards */}
        <OverviewCards
          totalIncome={stats?.summary.totalIncome || 0}
          totalExpense={stats?.summary.totalExpense || 0}
          netSavings={stats?.summary.netSavings || 0}
          savingsRate={stats?.summary.savingsRate || 0}
          budgets={budgets}
          onOpenBudgets={() => setActiveTab('budgets')}
        />

        {/* 2. AI Smart Natural Language Entry Section */}
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

        {/* 3. Section Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200/90 pb-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            {/* Tab 1: Danh sách Giao dịch */}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'transactions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Giao dịch ({transactions.length})</span>
            </button>

            {/* Tab 2: Dạng xem theo Lịch */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Lịch Chi tiêu</span>
            </button>

            {/* Tab 3: Locket Ảnh Khoảnh khắc */}
            <button
              onClick={() => setActiveTab('locket')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'locket'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Ảnh Locket ({transactions.filter((t) => !!t.receiptImage).length})</span>
            </button>

            {/* Tab 4: Biểu đồ Thống kê */}
            <button
              onClick={() => setActiveTab('charts')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'charts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Biểu đồ Thống kê</span>
            </button>

            {/* Tab 5: Ngân sách */}
            <button
              onClick={() => setActiveTab('budgets')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'budgets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Ngân sách & Hạn mức</span>
              {overBudgetsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>

          <button
            onClick={() => loadData(currentMonth)}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition shrink-0"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* 4. Tab Views */}
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

          {activeTab === 'charts' && (
            <ChartsView stats={stats} currentMonth={currentMonth} />
          )}

          {activeTab === 'budgets' && (
            <BudgetView
              budgets={budgets}
              currentMonth={currentMonth}
              onUpdateBudget={handleUpdateBudget}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            FinTrack © 2026 • Đồ án Quản lý Chi tiêu Cá nhân • Lập trình Web Nâng cao
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setIsDefenseModalOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              Tài liệu Báo cáo 15 Phút
            </button>
            <span>•</span>
            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              Event-Driven Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Đăng nhập / Đăng ký) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        message={authMessage}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Transaction Add/Edit Modal */}
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

      {/* Message Queue Event Monitor Modal */}
      <QueueMonitorModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />

      {/* Course Defense & Test Runner Hub Modal */}
      <DefenseHubModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        onRunValidationDemo={() => {
          setEditingTransaction(null);
          setAiPrefill(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Locket Photo Detail Modal */}
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
