import React, { useState } from 'react';
import {
  ShieldAlert,
  Edit2,
  Check,
  X,
  Plus,
  AlertTriangle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { Budget } from '../types';
import { CATEGORIES, formatVND } from '../utils/constants';

interface BudgetViewProps {
  budgets: Budget[];
  currentMonth: string;
  onUpdateBudget: (category: string, limit: number) => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  currentMonth,
  onUpdateBudget,
}) => {
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
    if (percent >= 100) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (percent >= 80) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const overallBudget = budgets.find((b) => b.category === 'ALL');
  const categoryBudgets = budgets.filter((b) => b.category !== 'ALL');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Quản lý Ngân sách & Hạn mức Chi tiêu
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi tiến độ chi tiêu tháng {currentMonth} và cảnh báo tự động
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Budget Hero Card */}
      {overallBudget && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                Ngân sách Tổng Hàng Tháng (ALL)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                {editingCategory === 'ALL' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={editLimitStr}
                      onChange={(e) => setEditLimitStr(e.target.value)}
                      className="px-3 py-1 rounded-lg text-slate-900 text-base font-bold bg-white w-40"
                    />
                    <button
                      onClick={() => handleSaveEdit('ALL')}
                      disabled={isSaving}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>{formatVND(overallBudget.limit)}</span>
                    <button
                      onClick={() => handleStartEdit(overallBudget)}
                      className="p-1 hover:bg-white/10 rounded-lg text-indigo-200 transition"
                      title="Chỉnh sửa hạn mức"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] text-indigo-200 block">Đã chi tiêu</span>
                <span className="text-lg font-bold text-rose-300">
                  {formatVND(overallBudget.spent || 0)}
                </span>
              </div>
              <div className="border-l border-indigo-800/80 pl-6">
                <span className="text-[11px] text-indigo-200 block">Còn lại</span>
                <span className="text-lg font-bold text-emerald-300">
                  {formatVND(overallBudget.remaining || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
              <span className="text-indigo-200">
                Tiến độ: {(overallBudget.percent || 0).toFixed(1)}%
              </span>
              {overallBudget.isOver && (
                <span className="text-rose-300 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> ĐÃ VƯỢT HẠN MỨC!
                </span>
              )}
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallBudget.isOver ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, overallBudget.percent || 0))}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Hạn mức theo từng danh mục
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBudgets.map((b) => {
            const meta = CATEGORIES.find((c) => c.name === b.category);
            const isEditing = editingCategory === b.category;
            const percent = b.percent || 0;

            return (
              <div
                key={b.category}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-lg shrink-0"
                      style={{ backgroundColor: meta ? meta.color : '#64748b' }}
                    />
                    <span className="font-bold text-sm text-slate-800">
                      {b.category}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeClass(
                      percent
                    )}`}
                  >
                    {percent.toFixed(0)}%
                  </span>
                </div>

                {/* Limit & Spent Numbers */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Đã chi:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatVND(b.spent || 0)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Hạn mức:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={editLimitStr}
                          onChange={(e) => setEditLimitStr(e.target.value)}
                          className="px-2 py-0.5 text-xs border border-indigo-400 rounded w-24 text-right"
                        />
                        <button
                          onClick={() => handleSaveEdit(b.category)}
                          disabled={isSaving}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end font-bold text-slate-600 text-sm">
                        <span>{formatVND(b.limit)}</span>
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          title="Sửa hạn mức"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                        percent
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>
                      {b.isOver ? (
                        <strong className="text-rose-600">
                          Vượt quá {formatVND((b.spent || 0) - b.limit)}
                        </strong>
                      ) : (
                        <span>Còn lại {formatVND(b.remaining || 0)}</span>
                      )}
                    </span>
                    <span>Hạn mức tháng</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
