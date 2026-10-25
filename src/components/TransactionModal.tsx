import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  AlertCircle,
  Check,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  DollarSign,
  FlaskConical,
  AlertTriangle,
  Camera,
  Trash2,
  Image as ImageIcon,
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

// Preset sample Locket-style images for testing
const PRESET_PHOTOS = [
  {
    name: '🍜 Bát bún bò',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: '☕ Cốc Highlands',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: '🛍️ Hóa đơn / Quần áo',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  prefill,
}) => {
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

  // Strict Validation states
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
    general?: string;
  }>({});
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
      // Reset
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

  // Handle Image Upload & Compression
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setReceiptImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  // Real-time amount validator
  const validateAmount = (val: string): string | undefined => {
    if (!val || val.trim() === '') {
      return 'Vui lòng nhập số tiền.';
    }
    // Check if contains non-digit characters except minus sign for test
    if (/[a-zA-Z]/.test(val)) {
      return 'Số tiền không hợp lệ. Không được chứa chữ cái!';
    }
    const num = Number(val);
    if (isNaN(num)) {
      return 'Số tiền không phải là một con số hợp lệ.';
    }
    if (num <= 0) {
      return 'Số tiền phải lớn hơn 0 (không được âm hoặc bằng 0).';
    }
    return undefined;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const amountErr = validateAmount(amountStr);
    const newErrors: { amount?: string; category?: string; date?: string; general?: string } = {};

    if (amountErr) {
      newErrors.amount = amountErr;
    }

    if (!category.trim()) {
      newErrors.category = 'Vui lòng chọn danh mục giao dịch.';
    }

    if (!date) {
      newErrors.date = 'Vui lòng chọn ngày giao dịch.';
    }

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
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Lỗi khi lưu giao dịch.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Error Cases for Defense
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

  // Filter categories by type
  const availableCategories = CATEGORIES.filter(
    (c) => c.type === 'both' || c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {initialData ? 'Chỉnh sửa Giao dịch' : 'Thêm Giao dịch Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                Ghi chép thu chi hàng ngày có kiểm tra dữ liệu chặt chẽ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Defense Demo Toolbar - 1-Click Error Simulation */}
        <div className="px-6 pt-3 pb-2 bg-amber-50/70 border-b border-amber-200/70">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>Thử nghiệm Validate Nhanh (Dành cho Giảng viên Chấm điểm):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleTriggerNegativeAmountDemo}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition"
              title="Thử nhập số tiền âm để kiểm tra thông báo lỗi đỏ"
            >
              ❌ Thử số âm (-50k)
            </button>
            <button
              type="button"
              onClick={handleTriggerLetterInAmountDemo}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition"
              title="Thử nhập chữ cái vào ô số tiền"
            >
              ❌ Thử nhập chữ ("nammuoik")
            </button>
            <button
              type="button"
              onClick={handleTriggerEmptyCategoryDemo}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition"
              title="Thử bỏ trống danh mục"
            >
              ⚠️ Thử bỏ trống danh mục
            </button>
            <button
              type="button"
              onClick={handleTriggerOverBudgetDemo}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition"
              title="Thử chi tiêu lớn để kích hoạt cảnh báo vượt ngân sách"
            >
              ⚡ Thử chi vượt ngân sách (3tr)
            </button>
          </div>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Loại giao dịch
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Ăn uống');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chi tiêu (-)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Lương');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Thu nhập (+)</span>
              </button>
            </div>
          </div>

          {/* Amount Input with Strict Validation Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Số tiền (VNĐ) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountStr(val);
                  const err = validateAmount(val);
                  setErrors((prev) => ({ ...prev, amount: err }));
                }}
                placeholder="Ví dụ: 50000"
                className={`w-full px-4 py-2.5 rounded-xl border text-base font-bold tracking-tight focus:outline-hidden transition shadow-2xs ${
                  errors.amount
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
              <div className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                VNĐ
              </div>
            </div>

            {/* Inline Error Message */}
            {errors.amount ? (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.amount}
              </p>
            ) : amountStr && !isNaN(Number(amountStr)) && Number(amountStr) > 0 ? (
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Tương đương: <strong>{formatVND(Number(amountStr))}</strong>
              </p>
            ) : null}
          </div>

          {/* Category Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Danh mục <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs text-slate-400">
                Đang chọn: <strong className="text-slate-800">{category || 'Chưa chọn'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {availableCategories.map((c) => {
                const isSelected = category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setCategory(c.name);
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition text-left ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>

            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Date & Payment Method (Two columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Ngày giao dịch <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ghi chú mô tả
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Ăn trưa bún bò với bạn cùng phòng..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Locket Photo Capture Section */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Ảnh Locket Lưu Trữ (Món ăn, hóa đơn, kỷ niệm)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                Locket Style
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              className="hidden"
            />

            {receiptImage ? (
              <div className="relative aspect-video sm:aspect-2/1 w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-amber-400 shadow-sm group">
                <img
                  src={receiptImage}
                  alt="Locket preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition"
                  >
                    Chụp lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptImage(undefined)}
                    className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold drop-shadow-md">
                  <span>📷 Đã đính kèm ảnh Locket</span>
                  <button
                    type="button"
                    onClick={() => setReceiptImage(undefined)}
                    className="text-rose-300 hover:text-white underline text-[10px]"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 text-amber-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Chụp ảnh từ máy / Chọn ảnh hóa đơn</span>
                </button>

                {/* Preset quick sample photos for 1-click preview */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-amber-800/80 font-medium">
                    Chọn nhanh ảnh mẫu:
                  </span>
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setReceiptImage(p.url)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition font-medium"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Đang kiểm tra...' : initialData ? 'Lưu thay đổi' : 'Thêm giao dịch'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
