import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  budgets: Array<{ isOver?: boolean; category: string; limit?: number; spent?: number }>; 
  onOpenBudgets: () => void;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  budgets,
  onOpenBudgets,
}) => {
  const budgetAlerts = budgets.filter((b) => b.isOver).length;

  const cards = [
    {
      label: 'Tổng thu nhập',
      value: formatVND(totalIncome),
      delta: '+ Tăng ổn định',
      accent: 'emerald',
      icon: ArrowDownCircle,
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Tổng chi tiêu',
      value: formatVND(totalExpense),
      delta: 'Đã kiểm soát tốt',
      accent: 'rose',
      icon: ArrowUpCircle,
      iconClass: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Tiết kiệm ròng',
      value: formatVND(netSavings),
      delta: `${savingsRate.toFixed(1)}% tỷ lệ tiết kiệm`,
      accent: 'sky',
      icon: PiggyBank,
      iconClass: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Ngân sách',
      value: `${budgetAlerts} cảnh báo`,
      delta: budgetAlerts > 0 ? 'Vượt hạn mức' : 'Ổn định',
      accent: 'violet',
      icon: TrendingUp,
      iconClass: 'bg-violet-100 text-violet-700',
      action: onOpenBudgets,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, delta, accent, icon: Icon, iconClass, action }) => (
        <div
          key={label}
          className={`group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.4)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_25px_55px_-28px_rgba(15,23,42,0.5)]`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
              accent === 'emerald'
                ? 'from-emerald-500 to-teal-400'
                : accent === 'rose'
                  ? 'from-rose-500 to-orange-400'
                  : accent === 'sky'
                    ? 'from-sky-500 to-cyan-400'
                    : 'from-violet-500 to-indigo-400'
            }`}
          />

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                accent === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : accent === 'rose'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : accent === 'sky'
                      ? 'border-sky-200 bg-sky-50 text-sky-700'
                      : 'border-violet-200 bg-violet-50 text-violet-700'
              }`}
            >
              {delta}
            </span>

            {action && (
              <button
                type="button"
                onClick={action}
                className="text-[10px] font-bold text-slate-500 transition hover:text-slate-800"
              >
                Chi tiết
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
