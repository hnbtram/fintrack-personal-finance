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





































































































































































































































