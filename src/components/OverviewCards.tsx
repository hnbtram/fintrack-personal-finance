import React from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../utils/constants';
import { Budget } from '../types';

interface OverviewCardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  budgets: Budget[];
  onOpenBudgets: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  budgets,
  onOpenBudgets,
}) => {
  // Find budgets that are exceeded or >= 90%
  const overBudgets = budgets.filter((b) => b.isOver);
  const warningBudgets = budgets.filter(
    (b) => !b.isOver && b.percent && b.percent >= 85
  );

  return (
    <div className="space-y-4">
      {/* Exceeded Budget Alert Banner */}
      {overBudgets.length > 0 && (
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                Cảnh báo ngân sách: Có {overBudgets.length} danh mục đã vượt hạn mức!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {overBudgets.map((b) => (
                  <span key={b.category} className="inline-block mr-2 font-medium">
                    • {b.category === 'ALL' ? 'Tổng ngân sách tháng' : b.category}:{' '}
                    Đã chi {formatVND(b.spent || 0)} / {formatVND(b.limit)} ({(b.percent || 0).toFixed(0)}%)
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBudgets}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition"
          >
            Quản lý ngân sách
          </button>
        </div>
      )}

      {/* Near Threshold Warning Banner */}
      {overBudgets.length === 0 && warningBudgets.length > 0 && (
        <div className="rounded-2xl p-3.5 bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-medium">
              Lưu ý: Danh mục{' '}
              <strong>{warningBudgets.map((b) => b.category).join(', ')}</strong> sắp
              chạm ngưỡng chi tiêu tối đa (trên 85%).
            </span>
          </div>
          <button
            onClick={onOpenBudgets}
            className="text-xs font-semibold text-amber-800 underline hover:text-amber-900 shrink-0"
          >
            Xem chi tiết
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Số dư ròng (Net Savings) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Số dư tháng này
            </span>
            <div className={`p-2 rounded-xl ${netSavings >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatVND(netSavings)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {netSavings >= 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Tài chính thặng dư tốt</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-700 font-medium">Chi tiêu vượt thu nhập</span>
              </>
            )}
          </div>
        </div>

        {/* 2. Tổng Thu nhập (Total Income) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng Thu nhập
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-700 tracking-tight">
            +{formatVND(totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Từ lương, thưởng và thu nhập phụ
          </div>
        </div>

        {/* 3. Tổng Chi tiêu (Total Expense) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng Chi tiêu
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
            -{formatVND(totalExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Bao gồm sinh hoạt, ăn uống, hóa đơn
          </div>
        </div>

        {/* 4. Tỷ lệ Tiết kiệm (Savings Rate) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tỷ lệ tiết kiệm
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 tracking-tight">
            {savingsRate}%
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  savingsRate >= 30
                    ? 'bg-emerald-500'
                    : savingsRate >= 15
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Mục tiêu khuyến nghị: 20-30%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
