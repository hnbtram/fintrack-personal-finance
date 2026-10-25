import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Check, HelpCircle, Bot } from 'lucide-react';
import { api } from '../services/api';
import { AIClassifyResult } from '../types';
import { formatVND } from '../utils/constants';

interface AIQuickEntryProps {
  onSuccessTransactionCreated: () => void;
  onOpenWithPrefill: (prefill: {
    amount: number;
    type: 'expense' | 'income';
    category: string;
    note: string;
  }) => void;
}

const SAMPLE_PROMPTS = [
  'Ăn trưa 50k',
  'Đổ xăng xe máy 70k',
  'Mua áo sơ mi Uniqlo 350k',
  'Nhận lương tháng 15 triệu',
  'Cà phê Highlands 65k',
  'Tiền điện nước phòng trọ 450k',
];

export const AIQuickEntry: React.FC<AIQuickEntryProps> = ({
  onSuccessTransactionCreated,
  onOpenWithPrefill,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIClassifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleClassify = async (textToClassify?: string) => {
    const text = (textToClassify || inputText).trim();
    if (!text) {
      setError('Vui lòng nhập câu miêu tả (ví dụ: "Ăn trưa 50k")');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    try {
      const data = await api.classifyAI(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Không thể phân loại AI lúc này');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSave = async () => {
    if (!result) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await api.createTransaction({
        amount: result.amount,
        type: result.type,
        category: result.category,
        date: today,
        note: result.note,
        paymentMethod: result.type === 'income' ? 'banking' : 'cash',
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setResult(null);
        setInputText('');
        setSavedSuccess(false);
        onSuccessTransactionCreated();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu giao dịch');
      setLoading(false);
    }
  };

  const handleEditDetails = () => {
    if (!result) return;
    onOpenWithPrefill({
      amount: result.amount,
      type: result.type,
      category: result.category,
      note: result.note,
    });
    setResult(null);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 rounded-2xl p-5 border border-indigo-100 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">
            Tự động Phân loại Giao dịch bằng AI (Gemini 3.8 Flash)
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            Điểm cộng Đồ án
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Chỉ cần gõ văn bản tự nhiên, hệ thống tự trích xuất số tiền & danh mục
        </span>
      </div>

      {/* Input box */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleClassify();
              }
            }}
            placeholder='Ví dụ: "Ăn trưa 50k", "Đổ xăng xe máy 70k", "Nhận lương 15tr"...'
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm shadow-xs"
          />
        </div>
        <button
          onClick={() => handleClassify()}
          disabled={loading || !inputText.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI Đang Phân Tích...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Phân loại AI</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <HelpCircle className="w-3 h-3" /> Gợi ý thử nhanh:
        </span>
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setInputText(prompt);
              handleClassify(prompt);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/90 shadow-2xs transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* AI Classified Result Card */}
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-indigo-200/90 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    result.type === 'income'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {result.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                </span>
                <span className="font-bold text-sm text-slate-900">
                  {result.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-base font-extrabold text-indigo-700">
                  {formatVND(result.amount)}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Ghi chú: "{result.note}"
              </p>
              <p className="text-[11px] text-slate-500 italic">
                💡 Lý do AI: {result.reasoning} ({result.source})
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleEditDetails}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Chỉnh sửa thêm
              </button>
              <button
                onClick={handleDirectSave}
                disabled={loading || savedSuccess}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition ${
                  savedSuccess
                    ? 'bg-emerald-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <span>Lưu giao dịch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
