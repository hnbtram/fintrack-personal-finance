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

  // Filter & sort
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
        return <Building2 className="w-3.5 h-3.5 text-blue-500" />;
      case 'e_wallet':
        return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
      case 'credit_card':
        return <CreditCard className="w-3.5 h-3.5 text-amber-500" />;
      case 'cash':
      default:
        return <Coins className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const item = PAYMENT_METHODS.find((p) => p.id === method);
    return item ? item.label : 'Tiền mặt';
  };

  // Export CSV
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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Title & Filter Bar */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Nhật ký Giao dịch
            </h3>
            <p className="text-xs text-slate-500">
              Hiển thị {filtered.length} / {transactions.length} giao dịch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Xuất danh sách sang file CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <span>+ Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ghi chú, danh mục..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Tất cả loại (Thu & Chi)</option>
            <option value="expense">Chỉ xem Chi tiêu (-)</option>
            <option value="income">Chỉ xem Thu nhập (+)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date_desc">Ngày: Mới nhất trước</option>
            <option value="date_asc">Ngày: Cũ nhất trước</option>
            <option value="amount_desc">Số tiền: Lớn nhất</option>
            <option value="amount_asc">Số tiền: Nhỏ nhất</option>
          </select>
        </div>
      </div>

      {/* Transaction Items */}
      {filtered.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Chưa có giao dịch phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không tìm thấy bản ghi nào khớp với bộ lọc hiện tại. Thử chọn danh mục khác hoặc tạo giao dịch mới!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>+ Tạo giao dịch ngay</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {filtered.map((tx) => {
            const cat = getCategoryMeta(tx.category);
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
              >
                {/* Left: Category Icon & Meta */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}30`,
                    }}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {tx.note || tx.category}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        {tx.category}
                      </span>

                      {/* Locket Photo Badge */}
                      {tx.receiptImage && (
                        <button
                          type="button"
                          onClick={() => onOpenPhotoModal?.(tx)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold transition shadow-2xs"
                          title="Xem ảnh Locket đã lưu"
                        >
                          <Camera className="w-3 h-3 text-amber-700" />
                          <span>Ảnh Locket</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDateVN(tx.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(tx.paymentMethod)}
                        <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold tracking-tight ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatVND(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {tx.type === 'income' ? 'Thu' : 'Chi'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Sửa giao dịch"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded transition"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="w-4 h-4" />
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
