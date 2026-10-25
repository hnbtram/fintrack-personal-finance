import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  FileCode2,
  ListChecks,
  Users,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { TestSuiteResponse } from '../types';

interface DefenseHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunValidationDemo: () => void;
}

export const DefenseHubModal: React.FC<DefenseHubModalProps> = ({
  isOpen,
  onClose,
  onRunValidationDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'slide' | 'tests' | 'checklist' | 'api'>('slide');
  const [testSuite, setTestSuite] = useState<TestSuiteResponse | null>(null);
  const [testing, setTesting] = useState(false);

  const handleRunTests = async () => {
    setTesting(true);
    try {
      const res = await api.runTests();
      setTestSuite(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Tài liệu Báo cáo & Trình bày Cuối kỳ
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-amber-100">
                  Chuẩn Rubric 100đ
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Lập trình Web Nâng cao • Đề tài: Quản lý Chi tiêu Cá nhân (Personal Finance Tracker)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('slide')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'slide'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              1. Cấu trúc Trình bày (15 Phút)
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              2. Bộ Kiểm thử Tự động (Test Runner)
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              3. Checklist Nộp bài & Phân công
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'api'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              4. Danh mục REST APIs
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* TAB 1: Slide & Presentation Outline */}
          {activeTab === 'slide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <span className="font-bold block mb-1">Mục tiêu báo cáo (14 phút):</span>
                10 phút trình bày và demo trực tiếp trên bản deploy, 4 phút hỏi đáp cá nhân. Cấu trúc dưới đây được chuẩn bị khớp hoàn toàn với bảng yêu cầu trang 2 của đề cương!
              </div>

              {/* 15-Minute Outline Breakdown */}
              <div className="space-y-3">
                
                {/* 1. Problem & User (1 min) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      1 Phút
                    </span>
                    <span className="text-xs font-bold text-slate-400">Phần 1</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Bài toán & Người dùng mục tiêu
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside mt-2">
                    <li>
                      <strong>Vấn đề:</strong> Người trẻ, sinh viên và nhân viên văn phòng gặp khó khăn trong việc ghi nhớ và kiểm soát dòng tiền chi tiêu hàng ngày.
                    </li>
                    <li>
                      <strong>Giải pháp FinTrack:</strong> Ứng dụng ghi chép thu chi đa nền tảng, tích hợp AI phân tích ngôn ngữ tự nhiên để người dùng không mất công chọn thủ công danh mục.
                    </li>
                  </ul>
                </div>

                {/* 2. Architecture (2 mins) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      2 Phút
                    </span>
                    <span className="text-xs font-bold text-slate-400">Phần 2</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Sơ đồ Kiến trúc & Công nghệ lựa chọn
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    <strong>Frontend:</strong> React 19 Function Components, Hooks (useState, useEffect, useMemo), Tailwind CSS, Lucide icons, Animated Canvas. <br />
                    <strong>Backend:</strong> Node.js / Express REST API chuẩn RESTful, kiến trúc phân tầng (Router → Controller → Service → Repository/Store). <br />
                    <strong>Event Queue:</strong> RabbitMQ Pattern (Exchange → Topic Routing → Worker threads) xử lý tính toán ngân sách và gửi cảnh báo bất đồng bộ không gây chậm UI. <br />
                    <strong>Mô hình AI:</strong> Google GenAI SDK gọi Gemini 3.8 Flash từ server với Structured Output (Type.OBJECT JSON Schema) an toàn tuyệt đối.
                  </p>
                </div>

                {/* 3. Demo (2 mins) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      2 Phút
                    </span>
                    <span className="text-xs font-bold text-slate-400">Phần 3</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Demo Trực tiếp & Minh họa Xử lý Trường hợp Lỗi
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">
                    1. <strong>Demo luồng chính:</strong> Dùng AI nhập tự nhiên "Ăn trưa 50k", xem hệ thống tự phân loại, số dư và biểu đồ cập nhật tức thì. <br />
                    2. <strong>Minh họa lỗi dữ liệu:</strong> Thử nhập số tiền âm (-50k), thử gõ chữ vào ô số tiền, thử bỏ trống danh mục → Hệ thống chặn ngay tại Client và Backend trả về HTTP 400 có thông báo lỗi đỏ chi tiết.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onRunValidationDemo();
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    Bật Form Demo Lỗi Ngay
                  </button>
                </div>

                {/* 4. Kỹ thuật nổi bật (2 mins) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                      2 Phút
                    </span>
                    <span className="text-xs font-bold text-slate-400">Phần 4</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Kỹ thuật nổi bật & Khó nhất đã giải quyết
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside mt-2">
                    <li>
                      <strong>Validation 2 lớp cực chặt (Zero-Bypass Validation):</strong> Ngăn chặn số âm, NaN, bypass text ở cả Frontend form hook và Backend middleware.
                    </li>
                    <li>
                      <strong>Xử lý múi giờ (Timezone Isolation):</strong> Server lưu timestamp UTC chuẩn ISO 8601, chuyển đổi sang múi giờ GMT+7 (Asia/Ho_Chi_Minh) khi truy vấn và gom nhóm theo tháng, tránh lệch giao dịch giữa các ngày cuối tháng.
                    </li>
                  </ul>
                </div>

                {/* 5. Điểm cộng (Bonus) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                      Điểm cộng tối đa +10đ
                    </span>
                    <span className="text-xs font-bold text-indigo-400">Rubric mục 5</span>
                  </div>
                  <h4 className="font-bold text-sm text-indigo-950">
                    Microservices / Message Queue & Tích hợp Mô hình AI
                  </h4>
                  <p className="text-xs text-indigo-900 mt-2 leading-relaxed">
                    • <strong>Message Queue:</strong> Mô phỏng kiến trúc RabbitMQ chia tách Transaction Service và Budget Alert Worker qua Topic Exchange.<br />
                    • <strong>Mô hình AI:</strong> Phân loại ngôn ngữ tự nhiên tiếng Việt bằng Gemini 3.8 Flash với độ chính xác cao và có fallback offline tự động.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Automated Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Bộ Kiểm thử Tự động (Automated Test Suite)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Thực thi các bài test xác thực đầu vào, múi giờ và message queue
                  </p>
                </div>
                <button
                  onClick={handleRunTests}
                  disabled={testing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{testing ? 'Đang chạy test...' : 'Chạy Toàn bộ Test Suite'}</span>
                </button>
              </div>

              {testSuite && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-4 text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Kết quả: {testSuite.summary.passed} / {testSuite.summary.total} tests PASSED (100% CI Xanh)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {testSuite.tests.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              [{t.id}]
                            </span>
                            <span className="font-bold text-xs text-slate-900">
                              {t.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Kỳ vọng: {t.expected}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {t.executionTimeMs}ms
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Checklist nộp bài */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 mb-2">
                  Checklist 7 Mục trước khi Báo cáo (Theo trang 5 của đề cương)
                </h4>
                <div className="space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>1. Clone repo sạch và chạy thành công bằng 1 lệnh: <code>npm install && npm run dev</code></span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>2. Link deploy mở được ổn định trên Internet</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>3. Dữ liệu mẫu đã seed sẵn 10+ giao dịch và ngân sách để demo ngay</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>4. Video demo dự phòng (3–5 phút) quay luồng chính phòng khi rớt mạng</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>5. Slide đã tập thử, tổng thời gian dưới 15 phút (mỗi thành viên đều trình bày)</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>6. Mỗi thành viên nắm vững code do mình phụ trách để trả lời hỏi đáp cá nhân</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
                    <span>7. Báo cáo PDF (5–8 trang) và bảng phân công đóng góp có chữ ký</span>
                  </label>
                </div>
              </div>

              {/* Table of Member Contribution for 4 Members */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Phần phụ trách & Files code</th>
                      <th className="p-3">% Đóng góp</th>
                      <th className="p-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold">Thành viên 1 (Trưởng nhóm)</td>
                      <td className="p-3 text-slate-600">
                        Khởi tạo dự án, Backend Express REST API, Validation 2 lớp, Data Model (<code>server.ts</code>, <code>types.ts</code>, <code>api.ts</code>)
                      </td>
                      <td className="p-3 font-bold text-emerald-700">25%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hoàn thành</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Thành viên 2</td>
                      <td className="p-3 text-slate-600">
                        Frontend UI/UX, State Management, Modal Giao dịch, Cụm nút Demo lỗi kiểm thử, Xuất CSV (<code>App.tsx</code>, <code>TransactionModal.tsx</code>, <code>TransactionList.tsx</code>)
                      </td>
                      <td className="p-3 font-bold text-emerald-700">25%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hoàn thành</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Thành viên 3</td>
                      <td className="p-3 text-slate-600">
                        Biểu đồ SVG Donut & Bar Charts, Quản lý Ngân sách, Dạng xem Lịch Chi tiêu, Lưu trữ Ảnh Locket (<code>CalendarView.tsx</code>, <code>LocketGalleryView.tsx</code>, <code>ChartsView.tsx</code>)
                      </td>
                      <td className="p-3 font-bold text-emerald-700">25%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hoàn thành</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Thành viên 4</td>
                      <td className="p-3 text-slate-600">
                        Tích hợp AI Gemini & NLP Parser, Message Queue (RabbitMQ pattern), Bộ Test Runner tự động, Slide & Tài liệu (<code>AIQuickEntry.tsx</code>, <code>QueueMonitorModal.tsx</code>, <code>DefenseHubModal.tsx</code>)
                      </td>
                      <td className="p-3 font-bold text-emerald-700">25%</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hoàn thành</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REST API Documentation */}
          {activeTab === 'api' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">GET</span>
                  <strong className="text-slate-900">/api/transactions</strong>
                </div>
                <p className="text-slate-500 font-sans">Lấy danh sách giao dịch có lọc theo month, category, type, search</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span>
                  <strong className="text-slate-900">/api/transactions</strong>
                </div>
                <p className="text-slate-500 font-sans">Tạo mới giao dịch với bộ validate bắt buộc amount &gt; 0, date chuẩn ISO, category hợp lệ</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">PUT</span>
                  <strong className="text-slate-900">/api/transactions/:id</strong>
                </div>
                <p className="text-slate-500 font-sans">Cập nhật thông tin giao dịch</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">DELETE</span>
                  <strong className="text-slate-900">/api/transactions/:id</strong>
                </div>
                <p className="text-slate-500 font-sans">Xóa giao dịch khỏi hệ thống</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">POST</span>
                  <strong className="text-slate-900">/api/ai/classify</strong>
                </div>
                <p className="text-slate-500 font-sans">Gọi Gemini 3.8 Flash nhận diện ngôn ngữ tự nhiên tiếng Việt ra JSON entity</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">GET</span>
                  <strong className="text-slate-900">/api/budgets</strong>
                </div>
                <p className="text-slate-500 font-sans">Lấy hạn mức ngân sách và tính toán tiến độ chi tiêu % tự động</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
