import React from 'react';
import { Wallet, Sparkles, PieChart, Camera, ShieldAlert, ArrowRight, LogIn } from 'lucide-react';

interface WelcomePageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const FEATURES = [
    {
        icon: Sparkles,
        color: 'bg-indigo-100 text-indigo-600',
        title: 'Nhập nhanh bằng AI',
        desc: 'Gõ "Ăn trưa 50k", hệ thống tự nhận diện số tiền và danh mục.',
    },
    {
        icon: PieChart,
        color: 'bg-emerald-100 text-emerald-600',
        title: 'Biểu đồ trực quan',
        desc: 'Theo dõi thu chi theo ngày, theo danh mục và tỷ lệ tiết kiệm.',
    },
    {
        icon: ShieldAlert,
        color: 'bg-amber-100 text-amber-600',
        title: 'Ngân sách & cảnh báo',
        desc: 'Đặt hạn mức cho từng danh mục và nhận cảnh báo khi sắp vượt.',
    },
    {
        icon: Camera,
        color: 'bg-rose-100 text-rose-600',
        title: 'Ảnh Locket',
        desc: 'Lưu lại khoảnh khắc chi tiêu cùng hóa đơn bằng hình ảnh.',
    },
];

export const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin, onRegister }) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-sans text-slate-800">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-teal-200/40 blur-3xl" />

            {/* Top bar */}
            <header className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        Fin<span className="text-emerald-600">Track</span>
                    </span>
                </div>
                <button
                    onClick={onLogin}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-white transition"
                >
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                </button>
            </header>

            {/* Hero */}
            <main className="relative max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Quản lý chi tiêu cá nhân thông minh
                </span>

                <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Chào mừng bạn đến với
                    <br />
                    Fin<span className="text-emerald-600">Track</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                    Ghi chép thu chi mỗi ngày, đặt ngân sách và hiểu rõ tiền của bạn đi đâu —
                    đơn giản, nhanh chóng, có AI hỗ trợ.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={onLogin}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Đăng nhập
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRegister}
                        className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3 rounded-2xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-base font-bold transition"
                    >
                        Tạo tài khoản mới
                    </button>
                </div>

                {/* Features */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 shadow-xs"
                        >
                            <div className={`p-2.5 rounded-xl ${f.color}`}>
                                <f.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{f.title}</h3>
                                <p className="mt-0.5 text-sm text-slate-600">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="relative text-center text-xs text-slate-500 pb-6">
                FinTrack © 2026 • Đồ án Quản lý Chi tiêu Cá nhân • Lập trình Web Nâng cao
            </footer>
        </div>
    );
};
