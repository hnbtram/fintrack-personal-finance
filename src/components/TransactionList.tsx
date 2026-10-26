import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Smartphone,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatVND, formatDateVN } from '../utils/constants';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenPhotoModal?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
  onOpenPhotoModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'expense' | 'income'>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  let filtered = transactions.filter((tx) => {
    if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;
    if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNote = tx.note.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchAmount = String(tx.amount).includes(q);
      if (!matchNote && !matchCat && !matchAmount) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  const getCategoryMeta = (catName: string) => {
    return CATEGORIES.find((c) => c.name === catName) || {
      name: catName,
      color: '#64748b',
      badgeClass: 'bg-slate-100 text-slate-800',
    };
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'banking':
        return <Building2 className="h-3.5 w-3.5 text-blue-500" />;
      case 'e_wallet':
        return <Smartphone className="h-3.5 w-3.5 text-violet-500" />;
      case 'credit_card':
        return <CreditCard className="h-3.5 w-3.5 text-amber-500" />;
      case 'cash':
      default:
        return <Coins className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const item = PAYMENT_METHODS.find((p) => p.id === method);
    return item ? item.label : 'Tiền mặt';
  };

  const handleExportCSV = () => {
    const headers = ['Mã', 'Loại', 'Danh mục', 'Số tiền (VND)', 'Ngày', 'Phương thức', 'Ghi chú'];
    const rows = filtered.map((t) => [
      t.id,
      t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      `"${t.category}"`,
      t.amount,
      t.date,
      `"${getPaymentMethodLabel(t.paymentMethod)}"`,
      `"${t.note.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTrack_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <div className="space-y-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-emerald-50/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Nhật ký Giao dịch</h3>
            <p className="text-xs text-slate-500">
              Hiển thị {filtered.length} / {transactions.length} giao dịch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              title="Xuất danh sách sang file CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-bold text-white shadow-[0_12px_30px_-18px_rgba(16,185,129,0.9)] transition hover:from-emerald-600 hover:to-teal-600"
            >
              <span>+ Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ghi chú, danh mục..."
              className="soft-ring w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-300"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="soft-ring rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-emerald-300"
          >
            <option value="ALL">Tất cả loại (Thu & Chi)</option>
            <option value="expense">Chỉ xem Chi tiêu (-)</option>
            <option value="income">Chỉ xem Thu nhập (+)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="soft-ring rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-emerald-300"
          >
            <option value="ALL">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="soft-ring w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 focus:border-emerald-300"
            >
              <option value="date_desc">Ngày: Mới nhất trước</option>
              <option value="date_asc">Ngày: Cũ nhất trước</option>
              <option value="amount_desc">Số tiền: Lớn nhất</option>
              <option value="amount_asc">Số tiền: Nhỏ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Inbox className="h-8 w-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">Chưa có giao dịch phù hợp</h4>
          <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
            Không tìm thấy bản ghi nào khớp với bộ lọc hiện tại. Thử chọn danh mục khác hoặc tạo giao dịch mới!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            <span>+ Tạo giao dịch ngay</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 bg-white/60">
          {filtered.map((tx) => {
            const cat = getCategoryMeta(tx.category);
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50/80"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}30`,
                    }}
                  >
                    {tx.type === 'income' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-slate-900">
                        {tx.note || tx.category}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        {tx.category}
                      </span>

                      {tx.receiptImage && (
                        <button
                          type="button"
                          onClick={() => onOpenPhotoModal?.(tx)}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 transition hover:bg-amber-200"
                          title="Xem ảnh Locket đã lưu"
                        >
                          <Camera className="h-3 w-3 text-amber-700" />
                          <span>Ảnh Locket</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDateVN(tx.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(tx.paymentMethod)}
                        <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="text-right">
                    <div
                      className={`text-sm font-black tracking-tight sm:text-base ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatVND(tx.amount)}
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {tx.type === 'income' ? 'Thu' : 'Chi'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Sửa giao dịch"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {isDeleting ? (
                      <div className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 p-1">
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-rose-700"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-200"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
