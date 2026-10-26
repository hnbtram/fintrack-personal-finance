import React, { useEffect, useState } from 'react';
import { X, Wallet, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { AuthUser } from '../services/auth';

interface AuthModalProps {
    isOpen: boolean;
    initialMode: 'login' | 'register';
    message?: string | null;
    closable?: boolean;
    onClose: () => void;
    onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    initialMode,
    message,
    closable = true,
    onClose,
    onSuccess,
}) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError(null);
            setFieldErrors({});
            setPassword('');
            setConfirm('');
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const switchMode = (m: 'login' | 'register') => {
        setMode(m);
        setError(null);
        setFieldErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const errs: Record<string, string> = {};

        if (mode === 'register' && !name.trim()) errs.name = 'Vui lòng nhập họ tên.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Email không hợp lệ.';
        if (password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        if (mode === 'register' && confirm !== password) errs.confirm = 'Mật khẩu nhập lại không khớp.';

        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const user =
                mode === 'login'
                    ? await api.login(email.trim(), password)
                    : await api.register(name.trim(), email.trim(), password);
            onSuccess(user);
        } catch (err: any) {
            if (err.errors) setFieldErrors(err.errors);
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = (hasErr?: string) =>
        `w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-white outline-none transition focus:ring-2 ${hasErr
            ? 'border-rose-300 focus:ring-rose-200'
            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
        }`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
                    {closable && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition"
                            title="Đóng"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {mode === 'login'
                                    ? 'Đăng nhập để ghi chép giao dịch của bạn'
                                    : 'Đăng ký miễn phí để bắt đầu quản lý chi tiêu'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                    {message && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {mode === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Họ và tên</label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className={inputCls(fieldErrors.name)}
                                />
                            </div>
                            {fieldErrors.name && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ban@example.com"
                                autoComplete="email"
                                className={inputCls(fieldErrors.email)}
                            />
                        </div>
                        {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ít nhất 6 ký tự"
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                className={`${inputCls(fieldErrors.password)} pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                title={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {fieldErrors.password && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password}</p>}
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nhập lại mật khẩu</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    autoComplete="new-password"
                                    className={inputCls(fieldErrors.confirm)}
                                />
                            </div>
                            {fieldErrors.confirm && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.confirm}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-emerald-600/30 transition"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                        {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                        <button
                            type="button"
                            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                            className="font-bold text-emerald-600 hover:text-emerald-700"
                        >
                            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};
