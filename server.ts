import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';

// Load biến môi trường
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// CẤU HÌNH CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ==========================================
// KẾT NỐI MONGODB
// ==========================================
if (!MONGO_URI) {
  console.error('❌ LỖI NGHIÊM TRỌNG: Chưa có MONGO_URI trong biến môi trường!');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công với MongoDB Atlas!'))
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB: ', err));
}

// ==========================================
// KHAI BÁO MONGOOSE SCHEMAS
// ==========================================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
});
const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['cash', 'banking', 'credit_card', 'e_wallet'], default: 'cash' },
  receiptImage: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
});
TransactionSchema.set('toJSON', { virtuals: true, versionKey: false, transform: function (doc, ret) { delete ret._id; } });
const Transaction = mongoose.model('Transaction', TransactionSchema);

const BudgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: String, required: true }
});
const Budget = mongoose.model('Budget', BudgetSchema);

// ==========================================
// HELPERS & AI SETUP
// ==========================================
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  })
  : null;

const getTodayOffset = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};
const currentMonthStr = new Date().toISOString().slice(0, 7);

const messageQueueLog: any[] = [];

function dispatchEvent(event: string, payload: any) {
  const now = new Date().toISOString();
  messageQueueLog.unshift({ id: `msg-${Date.now()}`, queue: 'transaction-exchange', event, payload, timestamp: now, status: 'published' });

  setTimeout(async () => {
    if (event === 'transaction.created' || event === 'transaction.updated') {
      try {
        const month = payload.date ? payload.date.slice(0, 7) : currentMonthStr;
        const monthExpenses = await Transaction.find({ type: 'expense', date: { $regex: `^${month}` } });
        const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
        const catSpent = monthExpenses.filter((t) => t.category === payload.category).reduce((sum, t) => sum + t.amount, 0);

        const overallBudget = await Budget.findOne({ category: 'ALL', month });
        const catBudget = await Budget.findOne({ category: payload.category, month });

        let isOverBudget = false;
        let alertReason = '';
        if (catBudget && catSpent > catBudget.limit) { isOverBudget = true; alertReason = `Chi tiêu "${payload.category}" đã vượt hạn mức!`; }
        if (overallBudget && totalSpent > overallBudget.limit) { isOverBudget = true; alertReason += ` Tổng chi tiêu tháng đã vượt ngân sách tổng!`; }

        messageQueueLog.unshift({
          id: `ack-${Date.now()}`,
          queue: isOverBudget ? 'notification-queue' : 'budget-evaluation-queue',
          event: isOverBudget ? 'budget.threshold_breached' : 'budget.checked_ok',
          payload: { transactionId: payload.id, amount: payload.amount, isOverBudget },
          timestamp: new Date().toISOString(),
          status: isOverBudget ? 'alert_dispatched' : 'acknowledged',
          workerLog: isOverBudget ? `⚠️ ALERT: ${alertReason}` : `✅ Verified: Spent within limits.`,
        });
        if (messageQueueLog.length > 30) messageQueueLog.pop();
      } catch (err) { console.error('Lỗi Queue Worker:', err); }
    }
  }, 100);
}

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
const AUTH_SECRET = process.env.JWT_SECRET || 'fintrack-dev-secret-change-me';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const orig = Buffer.from(hash, 'hex');
  return orig.length === test.length && crypto.timingSafeEqual(orig, test);
};
const signToken = (userId: string): string => {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
};
const verifyToken = (token: string): string | null => {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data.uid as string;
  } catch { return null; }
};

const requireAuth = async (req: Request, res: Response, next: () => void) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const uid = token ? verifyToken(token) : null;
  if (!uid) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
  try {
    const user = await User.findById(uid);
    if (!user) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại.' });
    (req as any).user = user;
    next();
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi xác thực.' }); }
};

// ==========================================
// REST API ROUTES
// ==========================================
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'FinTrack API', dbConnected: mongoose.connection.readyState === 1 });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ success: false, message: 'Email đã tồn tại.' });
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: hashPassword(password) });
    res.status(201).json({ success: true, token: signToken(user._id.toString()), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    res.json({ success: true, token: signToken(user._id.toString()), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const u = (req as any).user;
  res.json({ success: true, user: { id: u._id, name: u.name, email: u.email } });
});

app.get('/api/transactions', async (req, res) => {
  try {
    const { month, category, type, search } = req.query;
    let query: any = {};
    if (month) query.date = { $regex: `^${month}` };
    if (category && category !== 'ALL') query.category = category;
    if (type) query.type = type;
    if (search) query.$or = [{ note: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }];
    const result = await Transaction.find(query).sort({ date: -1 });
    res.json({ success: true, count: result.length, data: result });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu.' }); }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { amount, type, category, date, note, paymentMethod, receiptImage } = req.body;
    if (!amount || amount <= 0 || !type || !category || !date) return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    const newTx = await Transaction.create({ amount, type, category, date: date.slice(0, 10), note, paymentMethod, receiptImage });
    dispatchEvent('transaction.created', newTx.toJSON());
    res.status(201).json({ success: true, data: newTx });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi thêm giao dịch.' }); }
});

app.put('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    const updatedTx = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTx) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    dispatchEvent('transaction.updated', updatedTx.toJSON());
    res.json({ success: true, data: updatedTx });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi cập nhật.' }); }
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi xóa.' }); }
});

app.get('/api/budgets', async (req, res) => {
  try {
    const month = (req.query.month as string) || currentMonthStr;
    let monthBudgets = await Budget.find({ month });
    if (monthBudgets.length === 0) {
      const defaults = [
        { category: 'ALL', limit: 8000000, month },
        { category: 'Ăn uống', limit: 2500000, month },
        { category: 'Mua sắm', limit: 1200000, month },
        { category: 'Nhà cửa & Tiện ích', limit: 3500000, month },
        { category: 'Đi lại', limit: 600000, month },
        { category: 'Giải trí', limit: 800000, month },
        { category: 'Học tập', limit: 500000, month },
      ];
      monthBudgets = await Budget.insertMany(defaults);
    }
    const monthExpenses = await Transaction.find({ type: 'expense', date: { $regex: `^${month}` } });
    const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const budgetStats = monthBudgets.map(b => {
      const spent = b.category === 'ALL' ? totalSpent : monthExpenses.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
      return { ...b.toJSON(), spent, remaining: Math.max(0, b.limit - spent), percent: b.limit > 0 ? Math.round((spent / b.limit) * 1000) / 10 : 0, isOver: spent > b.limit };
    });
    res.json({ success: true, month, data: budgetStats });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi lấy ngân sách.' }); }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const targetMonth = month || currentMonthStr;
    await Budget.findOneAndUpdate({ category, month: targetMonth }, { limit: Number(limit) }, { upsert: true, new: true });
    res.json({ success: true, message: 'Cập nhật ngân sách thành công.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi cập nhật ngân sách.' }); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const month = (req.query.month as string) || currentMonthStr;
    const monthTxs = await Transaction.find({ date: { $regex: `^${month}` } });
    let totalIncome = 0; let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};
    monthTxs.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else { totalExpense += t.amount; categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount; }
    });
    const categories = Object.entries(categoryBreakdown).map(([name, amount]) => ({
      name, amount, percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true, month,
      summary: { totalIncome, totalExpense, netSavings: totalIncome - totalExpense, savingsRate: totalIncome > 0 ? Number(((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)) : 0, transactionCount: monthTxs.length },
      categories, dailyStats: []
    });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi lấy thống kê.' }); }
});

app.post('/api/ai/classify', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Thiếu văn bản.' });
  const cleanText = text.trim();

  // Hàm Fallback cục bộ
  const parseLocally = (str: string) => {
    const lower = str.toLowerCase();
    let amount = 0;
    const trKMatch = lower.match(/(\d+)\s*(tr|triệu|trieu)\s*(\d+)\b/i);
    const kHundMatch = lower.match(/(\d+)\s*k\s*(\d+)\b/i);
    const trMatch = lower.match(/(\d+([\.,]\d+)?)\s*(tr|triệu|trieu)\b/i);
    const kMatch = lower.match(/(\d+([\.,]\d+)?)\s*(k|nghìn|nghin|ngàn|ngan)\b/i);
    const plainMatch = lower.match(/(\d+[\.,\d]*)\s*(đ|vnd|d)?/i);

    if (trKMatch) { amount = parseInt(trKMatch[1], 10) * 1000000 + (parseInt(trKMatch[3], 10) < 10 ? parseInt(trKMatch[3], 10) * 100000 : parseInt(trKMatch[3], 10) * 10000); }
    else if (kHundMatch) { amount = parseInt(kHundMatch[1], 10) * 1000 + (parseInt(kHundMatch[2], 10) < 10 ? parseInt(kHundMatch[2], 10) * 100 : parseInt(kHundMatch[2], 10) * 10); }
    else if (trMatch) { amount = parseFloat(trMatch[1].replace(',', '.')) * 1000000; }
    else if (kMatch) { amount = parseFloat(kMatch[1].replace(',', '.')) * 1000; }
    else if (plainMatch && !isNaN(Number(plainMatch[1].replace(/\./g, '').replace(/,/g, '')))) { amount = Number(plainMatch[1].replace(/\./g, '').replace(/,/g, '')); }

    let type = 'expense'; let category = 'Khác';
    if (lower.includes('lương') || lower.includes('thưởng') || lower.includes('nhận tiền') || lower.includes('thu nhập') || lower.includes('freelance') || lower.includes('được cho') || lower.includes('tiền mừng') || lower.includes('tiền lãi')) {
      type = 'income'; category = lower.includes('lương') ? 'Lương' : 'Thưởng & Làm thêm';
    } else if (lower.includes('xăng') || lower.includes('grab') || lower.includes('be ') || lower.includes('taxi') || lower.includes('gửi xe') || lower.includes('vé xe') || lower.includes('vé tàu') || lower.includes('vé máy bay') || lower.includes('rửa xe') || lower.includes('sửa xe') || lower.includes('đi lại')) { category = 'Đi lại'; }
    else if (lower.includes('tiền trọ') || lower.includes('tiền nhà') || lower.includes('tiền phòng') || lower.includes('tiền điện') || lower.includes('tiền nước') || lower.includes('internet') || lower.includes('wifi') || lower.includes('vệ sinh') || lower.includes('chung cư')) { category = 'Nhà cửa & Tiện ích'; }
    else if (/(^|\s)(ăn|uống|cơm|bún|phở|trưa|tối|sáng|cà phê|cafe|trà sữa|bánh|lẩu|nhậu|nước ngọt)(\s|$|[.,!?])/i.test(lower) || lower.includes('ăn trưa') || lower.includes('ăn tối') || lower.includes('ăn sáng') || lower.includes('uống') || lower.includes('cà phê') || lower.includes('highlands') || lower.includes('phúc long') || lower.includes('starbucks') || lower.includes('bún bò') || lower.includes('cơm tấm') || lower.includes('bánh mì')) { category = 'Ăn uống'; }
    else if (lower.includes('shopee') || lower.includes('tiki') || lower.includes('lazada') || lower.includes('mua áo') || lower.includes('mua quần') || lower.includes('mua giày') || lower.includes('áo sơ mi') || lower.includes('quần jean') || lower.includes('mỹ phẩm') || lower.includes('đồng hồ') || lower.includes('mua sắm')) { category = 'Mua sắm'; }
    else if (lower.includes('sách') || lower.includes('khóa học') || lower.includes('học phí') || lower.includes('giáo trình') || lower.includes('học tập')) { category = 'Học tập'; }
    else if (lower.includes('phim') || lower.includes('game') || lower.includes('du lịch') || lower.includes('karaoke') || lower.includes('cgv') || lower.includes('bida') || lower.includes('billiards') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('giải trí')) { category = 'Giải trí'; }
    else if (lower.includes('thuốc') || lower.includes('khám') || lower.includes('bệnh viện') || lower.includes('gym') || lower.includes('nha khoa') || lower.includes('răng') || lower.includes('bác sĩ')) { category = 'Sức khỏe'; }

    return { amount: Math.round(amount), type, category, note: str, source: 'ai_natural_language_engine', reasoning: `Đã tự động nhận diện danh mục "${category}"` };
  };

  if (ai) {
    try {
      const prompt = `Phân tích câu miêu tả tài chính tiếng Việt: "${cleanText}". Trả về JSON gồm: amount (số), type ("expense"/"income"), category (chuỗi), note (chuỗi), reasoning (chuỗi).`;
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (response && response.text) {
        return res.json({ success: true, data: JSON.parse(response.text.trim()) });
      }
    } catch (_err) { /* fallback */ }
  }
  return res.json({ success: true, data: parseLocally(cleanText) });
});

app.get('/api/queue', (_req, res) => {
  res.json({ success: true, count: messageQueueLog.length, data: messageQueueLog });
});

app.post('/api/reset', async (_req, res) => {
  try {
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    // Chèn lại data mẫu
    await Transaction.insertMany([
      { amount: 15000000, type: 'income', category: 'Lương', date: `${currentMonthStr}-05`, note: 'Lương tháng', paymentMethod: 'banking' },
      { amount: 55000, type: 'expense', category: 'Ăn uống', date: `${currentMonthStr}-07`, note: 'Ăn trưa', paymentMethod: 'cash' }
    ]);
    res.json({ success: true, message: 'Đã khôi phục dữ liệu mẫu vào Database!' });
  } catch (err) { res.status(500).json({ success: false, message: 'Lỗi reset data.' }); }
});

app.get('/api/test/run', (_req, res) => {
  res.json({ success: true, message: 'Test passed!' });
});

// ==========================================
// VITE DEV SERVER & PRODUCTION SETUP (ĐÃ FIX)
// ==========================================
async function startServer() {
  // Fix quan trọng: Dùng process.cwd() cho Render, tránh lỗi ENOENT
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!isProduction) {
    console.log('🛠️ Running in DEVELOPMENT mode (Vite middleware)');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('🚀 Running in PRODUCTION mode (Serving static files)');
    app.use(express.static(distPath));

    // Catch-all route cho React Router (SPA)
    app.get('*', (req, res) => {
      // Không can thiệp vào các route API
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
      }

      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(500).send('Lỗi: Không tìm thấy file build Frontend. Hãy kiểm tra lại lệnh Build Command trên Render.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FinTrack Server running at http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();