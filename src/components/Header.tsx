import React from 'react';
import {
  Wallet,
  PlusCircle,
  Sparkles,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenAIQuick: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenAIQuick,
  onResetData,
}) => {
  const formatMonthTitle = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-');
      return `Tháng ${parseInt(month, 10)}, ${year}`;
    } catch {
      return mStr;
    }
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-[0_15px_30px_-12px_rgba(16,185,129,0.7)]">
                <Wallet className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    Fin<span className="text-emerald-600">Track</span>
                  </h1>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    Pro AI
                  </span>
                </div>
                <p className="hidden text-xs font-medium text-slate-500 sm:block">
                  Quản lý chi tiêu cá nhân • Lập trình Web Nâng cao
                </p>
              </div>
            </div>

            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner md:hidden">
              <button
                onClick={handlePrevMonth}
                className="rounded-xl p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
                title="Tháng trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm font-bold text-slate-700">{formatMonthTitle(currentMonth)}</span>
              <button
                onClick={handleNextMonth}
                className="rounded-xl p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
                title="Tháng sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="hidden items-center rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner md:flex">
            <button
              onClick={handlePrevMonth}
              className="rounded-xl p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
              title="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-700">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>{formatMonthTitle(currentMonth)}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="rounded-xl p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
              title="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAIQuick}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-sky-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 shadow-[0_12px_22px_-18px_rgba(99,102,241,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-18px_rgba(99,102,241,0.8)]"
              title="Nhập nhanh bằng AI tự nhiên"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-600" />
              <span>Nhập AI</span>
            </button>

            <button
              onClick={onResetData}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              title="Khôi phục dữ liệu mẫu"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_18px_30px_-18px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Giao dịch mới</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
