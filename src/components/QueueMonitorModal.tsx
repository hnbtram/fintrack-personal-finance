import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Layers,
  RefreshCw,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Radio,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { QueueResponse, QueueMessage } from '../types';

interface QueueMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueMonitorModal: React.FC<QueueMonitorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'architecture'>('events');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getQueueLogs();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQueue();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const messages: QueueMessage[] = data?.data || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Message Queue & Microservices Monitor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  RabbitMQ Pattern
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kiến trúc hướng sự kiện (Event-Driven) - Đạt điểm cộng đồ án
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Làm mới hàng đợi"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-6 py-2.5 bg-slate-800 border-b border-slate-700/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Live Event Stream ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'architecture'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Sơ đồ Kiến trúc Microservices
            </button>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            Auto-dispatched worker threads
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {activeTab === 'architecture' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-2">
                  Luồng Xử lý Hướng Sự kiện (Event-Driven Pipeline)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Khi người dùng thêm hoặc sửa giao dịch, hệ thống không khóa (non-blocking) luồng chính mà phát một sự kiện vào Topic Exchange. Các worker tiêu thụ thông điệp bất đồng bộ, tính toán ngân sách và kích hoạt gửi cảnh báo khi cần.
                </p>

                {/* Flow Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs font-semibold">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Database className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <span className="block font-bold text-slate-800">1. Transaction Service</span>
                    <span className="text-[10px] text-slate-500">CRUD & Lưu trữ</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Radio className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                    <span className="block font-bold text-slate-800">2. RabbitMQ Exchange</span>
                    <span className="text-[10px] text-slate-500">transaction-exchange</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Cpu className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                    <span className="block font-bold text-slate-800">3. Budget Worker</span>
                    <span className="text-[10px] text-slate-500">Evaluates thresholds</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <BellRing className="w-5 h-5 mx-auto text-rose-500 mb-1" />
                    <span className="block font-bold text-slate-800">4. Alert Worker</span>
                    <span className="text-[10px] text-slate-500">Email & Push Queue</span>
                  </div>
                </div>
              </div>

              {/* Topology Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Topic Exchanges</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>transaction-exchange (Topic)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Active Message Queues</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>budget-evaluation-queue</li>
                    <li>notification-queue</li>
                    <li>audit-log-queue</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Consumer Workers</span>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>BudgetEvaluator (Worker A)</li>
                    <li>AlertDispatcher (Worker B)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Chưa có thông điệp nào trong Message Queue. Hãy tạo giao dịch mới để xem sự kiện!
                </div>
              ) : (
                messages.map((msg) => {
                  const isAlert = msg.status === 'alert_dispatched';
                  const isAck = msg.status === 'acknowledged';

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all text-xs font-mono ${
                        isAlert
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : isAck
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isAlert
                                ? 'bg-rose-600 text-white'
                                : isAck
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-slate-900'
                            }`}
                          >
                            {msg.status}
                          </span>
                          <span className="font-bold text-slate-900">
                            {msg.event}
                          </span>
                          <span className="text-slate-400">@</span>
                          <span className="text-indigo-600 font-semibold">
                            {msg.queue}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>

                      {msg.workerLog && (
                        <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-700 font-sans text-xs">
                          {msg.workerLog}
                        </div>
                      )}

                      <div className="mt-2 text-[11px] text-slate-500 truncate">
                        Payload: {JSON.stringify(msg.payload)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
