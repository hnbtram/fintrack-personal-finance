import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  AlertCircle,
  Check,
  FlaskConical,
  AlertTriangle,
  Camera,
  Trash2,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatVND } from '../utils/constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: {
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    note: string;
    paymentMethod: PaymentMethod;
    receiptImage?: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
  prefill?: {
    amount: number;
    type: TransactionType;
    category: string;
    note: string;
  } | null;
}

const PRESET_PHOTOS = [
  { name: '🍜 Bát bún bò', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80' },
  { name: '☕ Cốc Highlands', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
  { name: '🛍️ Hóa đơn / Quần áo', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80' }
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, initialData, prefill }) => {
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('Ăn uống');
  const [date, setDate] = useState<string>(getTodayStr());
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note);
      setPaymentMethod(initialData.paymentMethod);
      setReceiptImage(initialData.receiptImage);
      setErrors({});
    } else if (prefill) {
      setType(prefill.type);
      setAmountStr(prefill.amount > 0 ? String(prefill.amount) : '');
      setCategory(prefill.category || (prefill.type === 'income' ? 'Lương' : 'Ăn uống'));
      setDate(getTodayStr());
      setNote(prefill.note || '');
      setPaymentMethod(prefill.type === 'income' ? 'banking' : 'cash');
      setReceiptImage(undefined);
      setErrors({});
    } else {
      setType('expense');
      setAmountStr('');
      setCategory('Ăn uống');
      setDate(getTodayStr());
      setNote('');
      setPaymentMethod('cash');
      setReceiptImage(undefined);
      setErrors({});
    }
  }, [initialData, prefill, isOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setReceiptImage(canvas.toDataURL('image/jpeg', 0.82));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const validateAmount = (val: string): string | undefined => {
    if (!val || val.trim() === '') return 'Vui lòng nhập số tiền.';
    if (/[a-zA-Z]/.test(val)) return 'Số tiền không hợp lệ. Không được chứa chữ cái!';
    const num = Number(val);
    if (isNaN(num)) return 'Số tiền không phải là một con số hợp lệ.';
    if (num <= 0) return 'Số tiền phải lớn hơn 0 (không được âm hoặc bằng 0).';
    return undefined;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const amountErr = validateAmount(amountStr);
    const newErrors: { amount?: string; category?: string; date?: string; general?: string } = {};

    if (amountErr) newErrors.amount = amountErr;
    if (!category.trim()) newErrors.category = 'Vui lòng chọn danh mục giao dịch.';
    if (!date) newErrors.date = 'Vui lòng chọn ngày giao dịch.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSave({
        amount: Number(amountStr),
        type,
        category,
        date,
        note,
        paymentMethod,
        receiptImage,
      });
      onClose();
    } catch (err: any) {
      setErrors(err.errors ? err.errors : { general: err.message || 'Lỗi khi lưu giao dịch.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerNegativeAmountDemo = () => {
    setAmountStr('-50000');
    setErrors({ amount: 'Số tiền phải lớn hơn 0 (không được âm hoặc bằng 0).' });
  };

  const handleTriggerLetterInAmountDemo = () => {
    setAmountStr('nammuoik');
    setErrors({ amount: 'Số tiền không hợp lệ. Không được chứa chữ cái!' });
  };

  const handleTriggerEmptyCategoryDemo = () => {
    setCategory('');
    setErrors({ category: 'Vui lòng chọn danh mục giao dịch.' });
  };

  const handleTriggerOverBudgetDemo = () => {
    setType('expense');
    setCategory('Ăn uống');
    setAmountStr('3000000');
    setNote('Đi ăn liên hoan buffet hải sản sang chảnh');
    setErrors({});
  };

  const availableCategories = CATEGORIES.filter((c) => c.type === 'both' || c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_-28px_rgba(15,23,42,0.7)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{initialData ? 'Chỉnh sửa Giao dịch' : 'Thêm Giao dịch Mới'}</h3>
              <p className="text-xs text-slate-500">Ghi chép thu chi hàng ngày có kiểm tra dữ liệu chặt chẽ</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>

        <div className="border-b border-amber-200 bg-amber-50/75 px-6 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-amber-800">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
            <span>Thử nghiệm Validate Nhanh:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={handleTriggerNegativeAmountDemo} className="rounded-lg border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800 transition hover:bg-rose-200">❌ Thử số âm (-50k)</button>
            <button type="button" onClick={handleTriggerLetterInAmountDemo} className="rounded-lg border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800 transition hover:bg-rose-200">❌ Thử chữ</button>
            <button type="button" onClick={handleTriggerEmptyCategoryDemo} className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-200">⚠️ Bỏ trống danh mục</button>
            <button type="button" onClick={handleTriggerOverBudgetDemo} className="rounded-lg border border-violet-300 bg-violet-100 px-2 py-1 text-[11px] font-bold text-violet-800 transition hover:bg-violet-200">⚡ Chi vượt ngân sách</button>
          </div>
        </div>

        {errors.general && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button type="button" onClick={() => { setType('expense'); setCategory('Ăn uống'); }} className={`rounded-xl py-2.5 text-xs font-black transition ${type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Chi tiêu (-)</button>
              <button type="button" onClick={() => { setType('income'); setCategory('Lương'); }} className={`rounded-xl py-2.5 text-xs font-black transition ${type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Thu nhập (+)</button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">Số tiền (VNĐ) <span className="text-rose-600">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountStr(val);
                  setErrors((prev) => ({ ...prev, amount: validateAmount(val) }));
                }}
                placeholder="Ví dụ: 50000"
                className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-base font-bold tracking-tight shadow-sm transition ${errors.amount ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500' : 'border-slate-300 text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500'}`}
              />
              <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">VNĐ</span>
            </div>
            {errors.amount ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600"><AlertCircle className="h-3.5 w-3.5" />{errors.amount}</p>
            ) : amountStr && !isNaN(Number(amountStr)) && Number(amountStr) > 0 ? (
              <p className="mt-1 text-xs font-medium text-slate-500">Tương đương: <strong className="text-slate-700">{formatVND(Number(amountStr))}</strong></p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">Danh mục <span className="text-rose-600">*</span></label>
              <span className="text-[11px] text-slate-400">Đang chọn: <strong className="text-slate-700">{category || 'Chưa chọn'}</strong></span>
            </div>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {availableCategories.map((c) => {
                const isSelected = category === c.name;
                return (
                  <button key={c.name} type="button" onClick={() => { setCategory(c.name); setErrors((prev) => ({ ...prev, category: undefined })); }} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${isSelected ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200/70'}`}>
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600"><AlertCircle className="h-3.5 w-3.5" />{errors.category}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">Ngày giao dịch <span className="text-rose-600">*</span></label>
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: undefined })); }} className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500" />
              {errors.date && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.date}</p>}
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">Phương thức thanh toán</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500">
                {PAYMENT_METHODS.map((pm) => <option key={pm.id} value={pm.id}>{pm.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">Ghi chú mô tả</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Ăn trưa bún bò với bạn cùng phòng..." className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900"><Camera className="h-4 w-4 text-amber-600" /><span>Ảnh Locket lưu trữ</span></div>
              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900">Locket style</span>
            </div>

            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" />

            {receiptImage ? (
              <div className="group relative overflow-hidden rounded-[20px] border-2 border-amber-300 bg-slate-900">
                <img src={receiptImage} alt="Locket preview" className="h-52 w-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/35 opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 to-transparent p-3 text-[11px] font-bold text-white">
                  <span>📷 Đã đính kèm ảnh Locket</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-white px-2.5 py-1 text-slate-900">Chụp lại</button>
                    <button type="button" onClick={() => setReceiptImage(undefined)} className="rounded-xl bg-rose-600 p-2 text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-400 bg-white px-4 py-3 text-xs font-black text-amber-800 transition hover:bg-amber-50"><Camera className="h-4 w-4 text-amber-600" /><span>Chụp ảnh từ máy / Chọn ảnh hóa đơn</span></button>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-amber-800/80">Chọn nhanh ảnh mẫu:</span>
                  {PRESET_PHOTOS.map((p) => <button key={p.name} type="button" onClick={() => setReceiptImage(p.url)} className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100">{p.name}</button>)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-sm transition ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>{isSubmitting ? 'Đang kiểm tra...' : initialData ? 'Lưu thay đổi' : 'Thêm giao dịch'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

import React, { useState } from 'react';
import { ShieldAlert, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { Budget } from '../types';
import { CATEGORIES, formatVND } from '../utils/constants';

interface BudgetViewProps {
  budgets: Budget[];
  currentMonth: string;
  onUpdateBudget: (category: string, limit: number) => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ budgets, currentMonth, onUpdateBudget }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimitStr, setEditLimitStr] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (budget: Budget) => {
    setEditingCategory(budget.category);
    setEditLimitStr(String(budget.limit));
  };

  const handleSaveEdit = async (category: string) => {
    const num = Number(editLimitStr);
    if (isNaN(num) || num < 0) return;
    setIsSaving(true);
    try {
      await onUpdateBudget(category, num);
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getBadgeClass = (percent: number) => {
    if (percent >= 100) return 'border-rose-200 bg-rose-100 text-rose-800';
    if (percent >= 80) return 'border-amber-200 bg-amber-100 text-amber-800';
    return 'border-emerald-200 bg-emerald-100 text-emerald-800';
  };

  const overallBudget = budgets.find((b) => b.category === 'ALL');
  const categoryBudgets = budgets.filter((b) => b.category !== 'ALL');

  return (
    <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.38)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><ShieldAlert className="h-5 w-5" /></div>
          <div>
            <h3 className="text-base font-black text-slate-900">Quản lý Ngân sách & Hạn mức Chi tiêu</h3>
            <p className="text-xs text-slate-500">Theo dõi tiến độ chi tiêu tháng {currentMonth} và cảnh báo tự động</p>
          </div>
        </div>
      </div>

      {overallBudget && (
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-5 text-white shadow-[0_20px_45px_-22px_rgba(15,23,42,0.85)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_28%)]" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300">Ngân sách Tổng Hàng Tháng (ALL)</span>
              <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {editingCategory === 'ALL' ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editLimitStr} onChange={(e) => setEditLimitStr(e.target.value)} className="w-40 rounded-xl bg-white px-3 py-1.5 text-base font-bold text-slate-900" />
                    <button onClick={() => handleSaveEdit('ALL')} disabled={isSaving} className="rounded-lg bg-emerald-500 p-1.5 text-white transition hover:bg-emerald-600"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingCategory(null)} className="rounded-lg bg-slate-700 p-1.5 text-white transition hover:bg-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{formatVND(overallBudget.limit)}</span>
                    <button onClick={() => handleStartEdit(overallBudget)} className="rounded-lg p-1 text-indigo-200 transition hover:bg-white/10" title="Chỉnh sửa hạn mức"><Edit2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div><span className="block text-[11px] text-indigo-200">Đã chi tiêu</span><span className="text-lg font-black text-rose-300">{formatVND(overallBudget.spent || 0)}</span></div>
              <div className="border-l border-indigo-700/80 pl-6"><span className="block text-[11px] text-indigo-200">Còn lại</span><span className="text-lg font-black text-emerald-300">{formatVND(overallBudget.remaining || 0)}</span></div>
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-indigo-200"><span>Tiến độ: {(overallBudget.percent || 0).toFixed(1)}%</span>{overallBudget.isOver && <span className="flex items-center gap-1 font-black text-rose-300"><AlertTriangle className="h-3.5 w-3.5" />ĐÃ VƯỢT HẠN MỨC!</span>}</div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80"><div className={`h-full rounded-full transition-all duration-500 ${overallBudget.isOver ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, Math.max(0, overallBudget.percent || 0))}%` }} /></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Hạn mức theo từng danh mục</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {categoryBudgets.map((b) => {
            const meta = CATEGORIES.find((c) => c.name === b.category);
            const isEditing = editingCategory === b.category;
            const percent = b.percent || 0;

            return (
              <div key={b.category} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/60 p-4 shadow-sm transition hover:border-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5"><span className="h-3.5 w-3.5 rounded-lg shrink-0" style={{ backgroundColor: meta ? meta.color : '#64748b' }} /><span className="text-sm font-black text-slate-800">{b.category}</span></div>
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${getBadgeClass(percent)}`}>{percent.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div><span className="block text-[10px] text-slate-400">Đã chi</span><span className="text-sm font-black text-slate-900">{formatVND(b.spent || 0)}</span></div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">Hạn mức</span>
                    {isEditing ? (
                      <div className="mt-0.5 flex items-center gap-1"><input type="number" value={editLimitStr} onChange={(e) => setEditLimitStr(e.target.value)} className="w-24 rounded-lg border border-indigo-400 bg-white px-2 py-1 text-right text-xs font-bold text-slate-800" /><button onClick={() => handleSaveEdit(b.category)} disabled={isSaving} className="rounded-md bg-emerald-600 p-1 text-white hover:bg-emerald-700"><Check className="h-3.5 w-3.5" /></button><button onClick={() => setEditingCategory(null)} className="rounded-md bg-slate-200 p-1 text-slate-700 hover:bg-slate-300"><X className="h-3.5 w-3.5" /></button></div>
                    ) : (
                      <div className="mt-0.5 flex items-center justify-end gap-1"><span className="text-sm font-black text-slate-700">{formatVND(b.limit)}</span><button onClick={() => handleStartEdit(b)} className="rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-indigo-600" title="Sửa hạn mức"><Edit2 className="h-3.5 w-3.5" /></button></div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full transition-all duration-300 ${getProgressColor(percent)}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400"><span>{b.isOver ? <span className="font-black text-rose-600">Vượt quá {formatVND((b.spent || 0) - b.limit)}</span> : <span>Còn lại {formatVND(b.remaining || 0)}</span>}</span><span>Hạn mức tháng</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

import React, { useState } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { MonthStats } from '../types';
import { CATEGORIES, formatVND } from '../utils/constants';

interface ChartsViewProps {
  stats: MonthStats | null;
  currentMonth: string;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ stats, currentMonth }) => {
  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  if (!stats) return <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Đang tải dữ liệu biểu đồ thống kê...</div>;

  const { summary, categories, dailyStats } = stats;
  const totalExpense = summary.totalExpense;
  const radius = 78;
  const strokeWidth = 30;
  const center = 110;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const slices = categories.map((cat, idx) => {
    const startPercent = cumulativePercent;
    const catPercent = totalExpense > 0 ? cat.amount / totalExpense : 0;
    cumulativePercent += catPercent;

    const strokeDasharray = `${catPercent * circumference} ${circumference}`;
    const strokeDashoffset = -startPercent * circumference;
    const meta = CATEGORIES.find((c) => c.name === cat.name);
    const color = meta ? meta.color : '#64748b';

    return { name: cat.name, amount: cat.amount, percentage: Math.round(catPercent * 1000) / 10, color, strokeDasharray, strokeDashoffset, idx };
  });

  const hoveredSlice = activeSlice !== null ? slices[activeSlice] : null;
  const activeDays = dailyStats.filter((d) => d.income > 0 || d.expense > 0);
  const maxDayAmount = Math.max(...activeDays.map((d) => Math.max(d.income, d.expense)), 1000000);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><PieChart className="h-5 w-5" /></div>
            <div><h3 className="text-base font-black text-slate-900">Cơ cấu Chi tiêu</h3><p className="text-xs text-slate-500">Phân bổ tỷ trọng theo danh mục</p></div>
          </div>

          {totalExpense === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">Chưa có dữ liệu chi tiêu trong tháng này để vẽ biểu đồ tròn.</div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 220 220">
                  <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                  {slices.map((slice) => (
                    <circle key={slice.name} cx={center} cy={center} r={radius} fill="transparent" stroke={slice.color} strokeWidth={activeSlice === slice.idx ? strokeWidth + 6 : strokeWidth} strokeDasharray={slice.strokeDasharray} strokeDashoffset={slice.strokeDashoffset} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setActiveSlice(slice.idx)} onMouseLeave={() => setActiveSlice(null)} />
                  ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  {hoveredSlice ? (
                    <>
                      <span className="max-w-[130px] truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{hoveredSlice.name}</span>
                      <span className="mt-0.5 text-sm font-black text-slate-900">{formatVND(hoveredSlice.amount)}</span>
                      <span className="text-xs font-black text-indigo-600">{hoveredSlice.percentage}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Tổng chi</span>
                      <span className="mt-0.5 text-sm font-black text-slate-900">{formatVND(totalExpense)}</span>
                      <span className="text-[11px] text-slate-400">{categories.length} danh mục</span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 w-full space-y-2 pr-1">
                {slices.map((slice) => (
                  <div key={slice.name} onMouseEnter={() => setActiveSlice(slice.idx)} onMouseLeave={() => setActiveSlice(null)} className={`flex cursor-pointer items-center justify-between rounded-2xl p-2 text-xs transition ${activeSlice === slice.idx ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                    <div className="flex min-w-0 items-center gap-2"><span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} /><span className="truncate text-slate-700">{slice.name}</span></div>
                    <div className="flex items-center gap-3 shrink-0"><span className="font-black text-slate-800">{formatVND(slice.amount)}</span><span className="w-10 text-right font-bold text-slate-400">{slice.percentage}%</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><BarChart3 className="h-5 w-5" /></div>
              <div><h3 className="text-base font-black text-slate-900">Thu nhập vs Chi tiêu theo Ngày</h3><p className="text-xs text-slate-500">Biểu đồ cột trực quan biến động dòng tiền tháng {currentMonth}</p></div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-emerald-500" /><span className="text-slate-700">Thu nhập</span></div>
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-rose-500" /><span className="text-slate-700">Chi tiêu</span></div>
            </div>
          </div>

          {activeDays.length === 0 ? (
            <div className="py-24 text-center text-xs text-slate-400">Chưa có giao dịch phát sinh trong tháng này để hiển thị biểu đồ cột.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-64 items-end gap-2 overflow-x-auto border-b border-slate-200 px-2 pb-2 pt-6">
                {dailyStats.filter((d) => d.day <= 31 && (d.income > 0 || d.expense > 0)).map((d) => {
                  const incomeHeight = (d.income / maxDayAmount) * 180;
                  const expenseHeight = (d.expense / maxDayAmount) * 180;

                  return (
                    <div key={d.day} className="group relative flex min-w-[36px] flex-1 flex-col items-center">
                      <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:flex">
                        <span className="font-black">Ngày {d.day}</span>
                        {d.income > 0 && <span className="text-emerald-400">Thu: +{formatVND(d.income)}</span>}
                        {d.expense > 0 && <span className="text-rose-400">Chi: -{formatVND(d.expense)}</span>}
                      </div>
                      <div className="flex h-48 items-end justify-center gap-1">
                        <div className="w-2.5 rounded-t-md bg-emerald-500 transition hover:bg-emerald-600 sm:w-3" style={{ height: `${Math.max(4, incomeHeight)}px` }} title={`Thu nhập: +${formatVND(d.income)}`} />
                        <div className="w-2.5 rounded-t-md bg-rose-500 transition hover:bg-rose-600 sm:w-3" style={{ height: `${Math.max(4, expenseHeight)}px` }} title={`Chi tiêu: -${formatVND(d.expense)}`} />
                      </div>
                      <span className="mt-2 text-[10px] font-black text-slate-500 group-hover:text-slate-900">N{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-2 text-[11px] text-slate-400"><span>Trục ngang: Các ngày có phát sinh thu chi</span><span>Đơn vị: VNĐ</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

