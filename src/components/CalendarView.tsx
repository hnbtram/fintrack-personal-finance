import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  Image as ImageIcon,
  Eye,
  X,
  CreditCard,
  Tag,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatVND, formatDateVN, CATEGORIES } from '../utils/constants';

interface CalendarViewProps {
  currentMonth: string; // YYYY-MM
  transactions: Transaction[];
  onSelectDateToAdd: (dateStr: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenPhotoModal: (tx: Transaction) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  transactions,
  onSelectDateToAdd,
  onEditTransaction,
  onOpenPhotoModal,
}) => {
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  // Calculate days in month and starting day of week
  // JS getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // We want Monday (T2) as first column: index 0 = Mon, 6 = Sun
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 = Mon, 6 = Sun

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group transactions by date
  const txByDate: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    if (!txByDate[tx.date]) {
      txByDate[tx.date] = [];
    }
    txByDate[tx.date].push(tx);
  });

  // Calculate day cells
  const totalSlots = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
  const days = [];

  for (let i = 0; i < totalSlots; i++) {
    const dayNumber = i - startDayOfWeek + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateStr = `${yearStr}-${String(monthStr).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const dayTxs = txByDate[dateStr] || [];
      const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const hasPhoto = dayTxs.some((t) => !!t.receiptImage);
      const photoCount = dayTxs.filter((t) => !!t.receiptImage).length;
      const firstPhotoTx = dayTxs.find((t) => !!t.receiptImage);

      days.push({
        inCurrentMonth: true,
        dayNumber,
        dateStr,
        txs: dayTxs,
        dayIncome,
        dayExpense,
        hasPhoto,
        photoCount,
        firstPhotoTx,
        isToday: dateStr === todayStr,
      });
    } else {
      days.push({
        inCurrentMonth: false,
        dayNumber: 0,
        dateStr: '',
        txs: [],
        dayIncome: 0,
        dayExpense: 0,
        hasPhoto: false,
        photoCount: 0,
        isToday: false,
      });
    }
  }

  // Selected day details
  const activeDayData = selectedDayStr
    ? days.find((d) => d.dateStr === selectedDayStr)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Lịch Chi tiêu & Thu nhập Tháng {month}/{year}
              </h3>
              <p className="text-xs text-slate-500">
                Nhấp vào từng ngày để xem chi tiết hoặc thêm giao dịch & ảnh Locket
              </p>
            </div>
          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Thu nhập (+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Chi tiêu (-)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-600">Ảnh Locket 📷</span>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-4 pb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="text-slate-700">T2</span>
          <span className="text-slate-700">T3</span>
          <span className="text-slate-700">T4</span>
          <span className="text-slate-700">T5</span>
          <span className="text-slate-700">T6</span>
          <span className="text-amber-600">T7</span>
          <span className="text-rose-600">CN</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((d, index) => {
            if (!d.inCurrentMonth) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[85px] sm:min-h-[110px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-100"
                />
              );
            }

            const isSelected = selectedDayStr === d.dateStr;
            const hasActivity = d.txs.length > 0;

            return (
              <div
                key={d.dateStr}
                onClick={() => setSelectedDayStr(d.dateStr)}
                className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md'
                    : d.isToday
                    ? 'border-emerald-400 bg-emerald-50/20 shadow-2xs'
                    : hasActivity
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    : 'border-slate-100 bg-white/70 hover:bg-slate-50 text-slate-400'
                }`}
              >
                {/* Top Row: Date Number & Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-extrabold w-6 h-6 rounded-full ${
                      d.isToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-800'
                    }`}
                  >
                    {d.dayNumber}
                  </span>

                  {/* Locket Photo Indicator Badge */}
                  {d.hasPhoto && (
                    <div
                      className="p-1 rounded-full bg-amber-100 text-amber-700 hover:scale-110 transition shadow-2xs"
                      title={`Có ${d.photoCount} ảnh Locket lưu trữ`}
                    >
                      <Camera className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Middle: Locket Photo Mini Thumbnail (if exists) */}
                {d.firstPhotoTx?.receiptImage && (
                  <div className="my-1 hidden sm:block relative overflow-hidden rounded-lg aspect-16/9 bg-slate-100 border border-slate-200 shadow-2xs">
                    <img
                      src={d.firstPhotoTx.receiptImage}
                      alt="Locket moment"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}

                {/* Bottom Row: Day Income & Expense Amounts */}
                <div className="space-y-0.5 mt-auto">
                  {d.dayIncome > 0 && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700 truncate leading-tight">
                      +{formatVND(d.dayIncome)}
                    </div>
                  )}
                  {d.dayExpense > 0 && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-rose-600 truncate leading-tight">
                      -{formatVND(d.dayExpense)}
                    </div>
                  )}
                  {!d.dayIncome && !d.dayExpense && (
                    <span className="text-[10px] text-slate-300 block text-center">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Day Transaction Drawer & Locket Photos */}
      {activeDayData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-xs font-bold">
                  {formatDateVN(activeDayData.dateStr)}
                </span>
                <h4 className="font-bold text-base text-slate-900">
                  Chi tiết Giao dịch & Ảnh Locket
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tổng thu: <strong className="text-emerald-600">+{formatVND(activeDayData.dayIncome)}</strong> • Tổng chi: <strong className="text-rose-600">-{formatVND(activeDayData.dayExpense)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectDateToAdd(activeDayData.dateStr)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm giao dịch ngày này</span>
              </button>
              <button
                onClick={() => setSelectedDayStr(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of Transactions on Selected Day */}
          {activeDayData.txs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Ngày này chưa có phát sinh giao dịch nào. Bạn có thể nhấn nút "Thêm giao dịch ngày này" để ghi nhận.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeDayData.txs.map((tx) => {
                const meta = CATEGORIES.find((c) => c.name === tx.category);

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Locket Photo or Icon */}
                      {tx.receiptImage ? (
                        <div
                          onClick={() => onOpenPhotoModal(tx)}
                          className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer relative group/img shadow-2xs"
                        >
                          <img
                            src={tx.receiptImage}
                            alt="Receipt"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${meta ? meta.color : '#64748b'}15`,
                            color: meta ? meta.color : '#64748b',
                          }}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {tx.note || tx.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          {tx.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-extrabold text-sm block ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatVND(tx.amount)}
                      </span>
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
