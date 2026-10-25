import React from 'react';
import {
  X,
  Heart,
  Calendar,
  CreditCard,
  Download,
  Share2,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatVND, formatDateVN, CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

interface PhotoDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
}) => {
  if (!transaction || !transaction.receiptImage) return null;

  const meta = CATEGORIES.find((c) => c.name === transaction.category);
  const payment = PAYMENT_METHODS.find((p) => p.id === transaction.paymentMethod);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = transaction.receiptImage!;
    link.download = `Locket_${transaction.date}_${transaction.category}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Locket Photo Container */}
        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
          <img
            src={transaction.receiptImage}
            alt={transaction.note || transaction.category}
            className="w-full h-full object-cover"
          />

          {/* Locket Header Floating Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-md">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: meta ? meta.color : '#eab308' }}
              />
              <span>{transaction.category}</span>
            </div>
            <div className="p-2 rounded-full bg-amber-500 text-white shadow-md">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>

          {/* Bottom Floating Info Pill (Locket Widget style) */}
          <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">
                  {transaction.type === 'income' ? 'Thu nhập' : 'Đã chi'}
                </span>
                <span className="text-xl font-black tracking-tight">
                  {formatVND(transaction.amount)}
                </span>
              </div>
              <span className="text-xs font-semibold text-white/80">
                {formatDateVN(transaction.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Details & Actions Footer */}
        <div className="p-5 space-y-4 bg-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ghi chú kỷ niệm
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {transaction.note || 'Không có ghi chú thêm'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Phương thức: <strong>{payment ? payment.label : 'Tiền mặt'}</strong></span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
