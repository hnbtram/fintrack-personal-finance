import React from 'react';
import {
  Wallet,
  PlusCircle,
  Sparkles,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { AuthUser } from '../services/auth';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenAIQuick: () => void;
  onResetData: () => void;
  user: AuthUser | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenAIQuick,
  onResetData,
  user,
  onLogin,
  onRegister,
  onLogout,
}) => {
  // Format currentMonth (e.g. "2026-10" -> "Tháng 10, 2026")
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">

          {/* Logo & Project Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Fin<span className="text-emerald-600">Track</span>
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Pro AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Quản lý Chi tiêu Cá nhân • Lập trình Web Nâng cao
                </p>
              </div>
            </div>

            {/* Quick Month Selector on Mobile */}
            <div className="flex md:hidden items-center bg-slate-100 rounded-lg p-1 text-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white rounded transition text-slate-600"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {formatMonthTitle(currentMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-white rounded transition text-slate-600"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Selector in Desktop */}
          <div className="hidden md:flex items-center bg-slate-100/80 border border-slate-200 rounded-xl p-1 shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:text-slate-900 rounded-lg transition text-slate-600"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 font-semibold text-sm text-slate-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{formatMonthTitle(currentMonth)}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:text-slate-900 rounded-lg transition text-slate-600"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Smart Entry */}
            <button
              onClick={onOpenAIQuick}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 text-indigo-700 hover:from-purple-100 hover:to-blue-100 border border-indigo-200/80 transition-all shadow-xs hover:shadow"
              title="Nhập nhanh bằng AI tự nhiên (ví dụ: Ăn trưa 50k)"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Nhập AI</span>
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              title="Khôi phục dữ liệu mẫu ban đầu để báo cáo lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Auth: Đăng nhập / Đăng ký / Đăng xuất */}
            {user ? (
              <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate" title={user.email}>
                  👋 {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={onRegister}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký</span>
                </button>
              </>
            )}

            {/* Add Transaction Main Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Giao dịch mới</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
