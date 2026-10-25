import React from 'react';
import {
  Camera,
  Heart,
  Plus,
  Eye,
  Calendar,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatVND, formatDateVN, CATEGORIES } from '../utils/constants';

interface LocketGalleryViewProps {
  transactions: Transaction[];
  onOpenPhotoModal: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const LocketGalleryView: React.FC<LocketGalleryViewProps> = ({
  transactions,
  onOpenPhotoModal,
  onOpenAddModal,
}) => {
  // Filter transactions that have photos
  const photoTransactions = transactions.filter((t) => !!t.receiptImage);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-white/20 text-white shadow-xs">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Khoảnh khắc Chi tiêu • Locket Moments
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {photoTransactions.length} bức ảnh
              </span>
            </div>
            <p className="text-xs text-amber-100 max-w-xl">
              Lưu giữ hình ảnh bữa ăn ngon, cốc trà sữa cùng bạn bè, hóa đơn mua sắm và những kỷ niệm chi tiêu mỗi ngày giống ứng dụng Locket.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-amber-700 font-bold text-xs shadow-md hover:bg-amber-50 hover:scale-105 active:scale-95 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Chụp ảnh chi tiêu mới</span>
          </button>
        </div>
      </div>

      {/* Grid of Locket Photos */}
      {photoTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base text-slate-800">
            Chưa có bức ảnh Locket nào được lưu trữ
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi thêm giao dịch mới, hãy nhấn nút <strong>"📷 Chụp ảnh Locket"</strong> để lưu lại ảnh cốc cà phê, đĩa cơm trưa hoặc hóa đơn nhé!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi chép & Chụp ảnh ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {photoTransactions.map((tx) => {
            const meta = CATEGORIES.find((c) => c.name === tx.category);

            return (
              <div
                key={tx.id}
                onClick={() => onOpenPhotoModal(tx)}
                className="group relative bg-white rounded-3xl p-3 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Locket Photo Frame */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                  <img
                    src={tx.receiptImage}
                    alt={tx.note || tx.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

                  {/* Top Category Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: meta ? meta.color : '#eab308' }}
                    />
                    <span>{tx.category}</span>
                  </div>

                  {/* Top Heart Badge */}
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-amber-500/80 backdrop-blur-md text-white shadow-xs">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>

                  {/* Bottom Amount & Note Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-base font-black tracking-tight drop-shadow-md">
                      {formatVND(tx.amount)}
                    </div>
                    <div className="text-xs font-semibold text-white/90 truncate drop-shadow-sm">
                      {tx.note || tx.category}
                    </div>
                  </div>

                  {/* Hover Eye View Action */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/30">
                      <Eye className="w-4 h-4" />
                      <span>Xem Locket</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-3 px-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDateVN(tx.date)}
                  </span>
                  <span className="font-bold text-amber-700 hover:underline">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
