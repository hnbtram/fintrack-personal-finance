import React, { useState } from 'react';
import { PieChart, BarChart3, TrendingUp, Calendar, Layers } from 'lucide-react';
import { MonthStats } from '../types';
import { CATEGORIES, formatVND } from '../utils/constants';

interface ChartsViewProps {
  stats: MonthStats | null;
  currentMonth: string;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ stats, currentMonth }) => {
  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  if (!stats) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
        Đang tải dữ liệu biểu đồ thống kê...
      </div>
    );
  }

  const { summary, categories, dailyStats } = stats;

  // Donut Chart calculations
  const totalExpense = summary.totalExpense;
  const radius = 80;
  const strokeWidth = 32;
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

    return {
      name: cat.name,
      amount: cat.amount,
      percentage: Math.round(catPercent * 1000) / 10,
      color,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const hoveredSlice = activeSlice !== null ? slices[activeSlice] : null;

  // Bar Chart calculations (Filter only days with non-zero income or expense for clean visual)
  const activeDays = dailyStats.filter((d) => d.income > 0 || d.expense > 0);
  const maxDayAmount = Math.max(
    ...activeDays.map((d) => Math.max(d.income, d.expense)),
    1000000
  );

  return (
    <div className="space-y-6">
      
      {/* 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Donut Chart - Phân bổ chi tiêu theo Danh mục */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Cơ cấu Chi tiêu
                  </h3>
                  <p className="text-xs text-slate-500">Phân bổ tỷ trọng theo danh mục</p>
                </div>
              </div>
            </div>

            {totalExpense === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Chưa có dữ liệu chi tiêu trong tháng này để vẽ biểu đồ tròn.
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* SVG Donut */}
                <div className="relative w-56 h-56 flex items-center justify-center my-2">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
                    {/* Background ring */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth={strokeWidth}
                    />

                    {/* Slices */}
                    {slices.map((slice) => (
                      <circle
                        key={slice.name}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={activeSlice === slice.idx ? strokeWidth + 6 : strokeWidth}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setActiveSlice(slice.idx)}
                        onMouseLeave={() => setActiveSlice(null)}
                      />
                    ))}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    {hoveredSlice ? (
                      <>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[130px]">
                          {hoveredSlice.name}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {formatVND(hoveredSlice.amount)}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                          {hoveredSlice.percentage}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Tổng chi
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {formatVND(totalExpense)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {categories.length} danh mục
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Slices Legend */}
                <div className="w-full mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {slices.map((slice) => (
                    <div
                      key={slice.name}
                      onMouseEnter={() => setActiveSlice(slice.idx)}
                      onMouseLeave={() => setActiveSlice(null)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                        activeSlice === slice.idx
                          ? 'bg-slate-100 font-bold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="text-slate-800 truncate">{slice.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-900 font-bold">{formatVND(slice.amount)}</span>
                        <span className="text-slate-400 font-medium w-10 text-right">
                          {slice.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Daily Comparison Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Thu nhập vs Chi tiêu theo Ngày
                  </h3>
                  <p className="text-xs text-slate-500">
                    Biểu đồ cột trực quan biến động dòng tiền tháng {currentMonth}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span className="text-slate-700">Thu nhập</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-500" />
                  <span className="text-slate-700">Chi tiêu</span>
                </div>
              </div>
            </div>

            {activeDays.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs">
                Chưa có giao dịch phát sinh trong tháng này để hiển thị biểu đồ cột.
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG/CSS Bar Chart Grid */}
                <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 overflow-x-auto">
                  {dailyStats
                    .filter((d) => d.day <= 31 && (d.income > 0 || d.expense > 0))
                    .map((d) => {
                      const incomeHeight = (d.income / maxDayAmount) * 180;
                      const expenseHeight = (d.expense / maxDayAmount) * 180;

                      return (
                        <div
                          key={d.day}
                          className="flex flex-col items-center flex-1 min-w-[36px] group relative"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none shadow-lg whitespace-nowrap">
                            <span className="font-bold">Ngày {d.day}</span>
                            {d.income > 0 && (
                              <span className="text-emerald-400">Thu: +{formatVND(d.income)}</span>
                            )}
                            {d.expense > 0 && (
                              <span className="text-rose-400">Chi: -{formatVND(d.expense)}</span>
                            )}
                          </div>

                          {/* Bars Pair */}
                          <div className="flex items-end gap-1 h-48 w-full justify-center">
                            {/* Income Bar */}
                            <div
                              className="w-2.5 sm:w-3 bg-emerald-500 rounded-t-md transition-all duration-300 hover:bg-emerald-600"
                              style={{ height: `${Math.max(4, incomeHeight)}px` }}
                              title={`Thu nhập: +${formatVND(d.income)}`}
                            />
                            {/* Expense Bar */}
                            <div
                              className="w-2.5 sm:w-3 bg-rose-500 rounded-t-md transition-all duration-300 hover:bg-rose-600"
                              style={{ height: `${Math.max(4, expenseHeight)}px` }}
                              title={`Chi tiêu: -${formatVND(d.expense)}`}
                            />
                          </div>

                          {/* Day Label */}
                          <span className="mt-2 text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                            N{d.day}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>Trục ngang: Các ngày có phát sinh thu chi</span>
                  <span>Đơn vị: VNĐ</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
