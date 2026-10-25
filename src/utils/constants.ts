export interface CategoryMeta {
  name: string;
  type: 'expense' | 'income' | 'both';
  icon: string;
  color: string;
  bgLight: string;
  badgeClass: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Ăn uống',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316',
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Đi lại',
    type: 'expense',
    icon: 'Car',
    color: '#0284c7',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  {
    name: 'Mua sắm',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899',
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    badgeClass: 'bg-pink-100 text-pink-800',
  },
  {
    name: 'Nhà cửa & Tiện ích',
    type: 'expense',
    icon: 'Home',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    name: 'Giải trí',
    type: 'expense',
    icon: 'Gamepad2',
    color: '#eab308',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'Học tập',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Sức khỏe',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ef4444',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800',
  },
  {
    name: 'Lương',
    type: 'income',
    icon: 'Wallet',
    color: '#059669',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Thưởng & Làm thêm',
    type: 'income',
    icon: 'TrendingUp',
    color: '#0d9488',
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeClass: 'bg-teal-100 text-teal-800',
  },
  {
    name: 'Khác',
    type: 'both',
    icon: 'Tag',
    color: '#64748b',
    bgLight: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800',
  },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tiền mặt', icon: 'Coins' },
  { id: 'banking', label: 'Chuyển khoản NH', icon: 'Building2' },
  { id: 'e_wallet', label: 'Ví MoMo/ZaloPay', icon: 'Smartphone' },
  { id: 'credit_card', label: 'Thẻ tín dụng', icon: 'CreditCard' },
];

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
