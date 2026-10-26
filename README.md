# FinTrack - Ứng dụng Quản lý Chi tiêu Cá nhân Thông minh (Personal Finance Tracker)

> **Môn học:** Lập trình Web Nâng cao  
> **Đề tài:** Ứng dụng Quản lý Chi tiêu Cá nhân (Personal Finance Tracker)  
> **Điểm nổi bật:** Đăng ký / đăng nhập, lưu trữ MongoDB, tích hợp AI Gemini (phân loại tự động), Kiến trúc Event-Driven Message Queue (RabbitMQ Pattern), Validation chặt chẽ và Biểu đồ thống kê trực quan.

---

## 1. Giới thiệu & Bài toán giải quyết
- **Bài toán:** Hỗ trợ người dùng (sinh viên, nhân viên văn phòng) ghi chép thu/chi hàng ngày nhanh chóng, trực quan hóa dòng tiền và cảnh báo chủ động khi chi tiêu vượt hạn mức ngân sách tháng.
- **Tính năng chính:**
  1. **Tài khoản người dùng:** Trang chào mừng khi chưa đăng nhập, đăng ký / đăng nhập bằng email và mật khẩu (băm scrypt, token có hạn 7 ngày). Thêm, sửa, xóa giao dịch yêu cầu đăng nhập.
  2. **CRUD Giao dịch & Ảnh Locket:** Thêm, Sửa, Xóa giao dịch thu/chi với đầy đủ số tiền, danh mục, ngày, ghi chú, phương thức thanh toán và **ảnh chụp/lưu trữ giống ứng dụng Locket (chụp ảnh hóa đơn, đĩa cơm trưa, cốc cà phê)**. Ảnh được nén về tối đa 800px ngay trên trình duyệt. Danh sách giao dịch hỗ trợ tìm kiếm, sắp xếp và xuất CSV.
  3. **Dạng xem theo Lịch (Calendar View):** Hiển thị lịch biểu chi tiết từng ngày trong tháng, trực quan hóa số tiền thu (+) và chi (-) phát sinh trong ngày, kèm biểu tượng ảnh Locket và ngăn kéo chi tiết khi click vào từng ngày.
  4. **Locket Moments (Thư viện Ảnh Chi tiêu):** Tab riêng hiển thị toàn bộ những khoảnh khắc chi tiêu qua hình ảnh dạng widget Locket sinh động.
  5. **Thống kê & Biểu đồ trực quan:** Biểu đồ tròn Donut phân bổ tỷ trọng theo danh mục, các thẻ tổng quan số dư ròng, tổng thu, tổng chi và tỷ lệ tiết kiệm (Savings Rate).
  6. **Đặt Ngân sách & Cảnh báo vượt hạn mức:** Thiết lập ngân sách tổng tháng và ngân sách cho từng danh mục, thanh đo tiến độ (Xanh lá <80%, Vàng cam 80-100%, Đỏ từ 100% trở lên).
  7. **Tích hợp AI Gemini (Điểm cộng):** Nhập văn bản tự nhiên như *"Ăn trưa 50k"*, *"Đổ xăng xe máy 70k"*, *"Nhận lương tháng 15 triệu"* → AI trích xuất số tiền, phân loại danh mục và điền sẵn vào form giao dịch.
  8. **Mô phỏng Microservices / Message Queue (Điểm cộng):** Tách biệt Transaction Service và Worker xử lý ngân sách qua Topic Exchange, đẩy event vào `budget-evaluation-queue` và `notification-queue`.
  9. **Demo Kiểm tra lỗi (Defense Mode):** Nút thử nghiệm nhanh cho Giảng viên (Thử số tiền âm, thử nhập chữ cái, thử bỏ trống danh mục, thử chi vượt ngân sách) minh họa cơ chế validate input và thông báo lỗi.

---

## 2. Hướng dẫn cài đặt & Khởi chạy nhanh

**Yêu cầu:** Node.js 20+ và một cụm MongoDB (ví dụ MongoDB Atlas miễn phí).

**Bước 1 - Tải mã nguồn và cài thư viện:**

```bash
git clone https://github.com/hnbtram/fintrack-personal-finance.git
cd fintrack-personal-finance
npm install
```

**Bước 2 - Tạo file `.env` ở thư mục gốc** (file này không được commit lên GitHub):

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
AUTH_SECRET=<chuoi-bi-mat-ngau-nhien-dai>
GEMINI_API_KEY=<khong-bat-buoc>
```

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `MONGO_URI` | Có | Chuỗi kết nối MongoDB |
| `AUTH_SECRET` | Nên có | Khóa ký token đăng nhập, bỏ trống sẽ dùng khóa mặc định (chỉ phù hợp khi phát triển) |
| `GEMINI_API_KEY` | Không | Dùng cho tính năng nhập nhanh bằng AI |
| `PORT` | Không | Mặc định `3000` |

**Bước 3 - Khởi chạy:**

```bash
npm run dev
```

Ứng dụng full-stack (gồm cả Backend Express REST API và Frontend React Vite) sẽ khởi động tại:
```
http://localhost:3000
```

---

## 3. Kiến trúc Hệ thống (Architecture)

```
╔═════════════════════════════════════════════════════════════╗
║                  FRONTEND  (React 19 + Vite)                ║
║  • Welcome Page, đăng ký / đăng nhập                        ║
║  • 5 tab: Giao dịch · Lịch · Locket · Biểu đồ · Ngân sách   ║
║  • Biểu đồ SVG Donut, Tailwind CSS, Lucide Icons            ║
║  • Validate form thời gian thực phía client                 ║
╚═══════════════════════════╤═════════════════════════════════╝
                            │  HTTP / REST API (JSON)
                            │  Authorization: Bearer <token>
╔═══════════════════════════▼═════════════════════════════════╗
║                BACKEND  (Node.js / Express)                 ║
║  • REST: /api/auth · /api/transactions · /api/budgets       ║
║          /api/stats · /api/ai · /api/queue                  ║
║  • Auth: mật khẩu scrypt + salt, token HMAC-SHA256          ║
║  • Validation đầu vào, trả HTTP 400 khi dữ liệu sai         ║
╚═════╤═══════════════════════╤══════════════════════╤════════╝
      │                       │                      │
╔═════▼═════════════╗ ╔═══════▼═════════════╗ ╔══════▼═══════════════════╗
║  MongoDB Atlas    ║ ║    AI Service       ║ ║ Message Queue (mô phỏng) ║
║  (Mongoose)       ║ ║                     ║ ║                          ║
║  • users          ║ ║ • Google GenAI SDK  ║ ║ • transaction-exchange   ║
║  • transactions   ║ ║ • gemini-2.0-flash  ║ ║   (Topic Exchange)       ║
║  • budgets        ║ ║ • Kết quả dạng JSON ║ ║ • budget-evaluation-queue║
║                   ║ ║                     ║ ║ • notification-queue     ║
╚═══════════════════╝ ╚═════════════════════╝ ╚══════════════════════════╝
```

**Luồng sự kiện khi tạo giao dịch:** lưu vào MongoDB → phát `transaction.created` vào `transaction-exchange` → Budget Worker so sánh chi tiêu với ngân sách → ghi kết quả vào `budget-evaluation-queue` (trong hạn mức) hoặc `notification-queue` (vượt hạn mức).

---

## 4. Danh sách REST API chính

| Method | Endpoint | Đăng nhập | Mô tả |
|---|---|---|---|
| `GET` | `/api/health` | Không | Kiểm tra trạng thái máy chủ và kết nối MongoDB |
| `POST` | `/api/auth/register` | Không | Đăng ký tài khoản (tên, email, mật khẩu từ 6 ký tự) |
| `POST` | `/api/auth/login` | Không | Đăng nhập, trả về token |
| `GET` | `/api/auth/me` | Có | Lấy thông tin người dùng hiện tại |
| `GET` | `/api/transactions` | Không | Lấy danh sách giao dịch (hỗ trợ lọc month, category, type, search) |
| `POST` | `/api/transactions` | Có | Tạo mới giao dịch (validate số tiền > 0, phát event sang Queue) |
| `PUT` | `/api/transactions/:id` | Có | Cập nhật thông tin giao dịch |
| `DELETE` | `/api/transactions/:id` | Có | Xóa giao dịch khỏi hệ thống |
| `GET` | `/api/budgets` | Không | Lấy danh sách hạn mức và tiến độ chi tiêu % |
| `POST` | `/api/budgets` | Không | Thiết lập hoặc cập nhật hạn mức ngân sách |
| `GET` | `/api/stats` | Không | Thống kê số dư, tỷ lệ tiết kiệm và phân bổ theo danh mục |
| `POST` | `/api/ai/classify` | Không | AI phân tích ngôn ngữ tự nhiên thành entity giao dịch |
| `GET` | `/api/queue` | Không | Xem log hàng đợi thông điệp và kết quả của worker |
| `GET` | `/api/test/run` | Không | Dữ liệu cho tab kiểm thử trong cửa sổ báo cáo |
| `POST` | `/api/reset` | Không | Khôi phục dữ liệu mẫu để demo lại |

---

## 5. Kỹ thuật nổi bật & Phục vụ phản biện
1. **Validation nhiều lớp:**
   - Giao diện báo lỗi ngay khi gõ nếu số tiền chứa chữ cái, không phải số hoặc nhỏ hơn hoặc bằng 0, và bắt buộc chọn danh mục.
   - Backend từ chối (HTTP 400) khi thiếu số tiền, số tiền <= 0, thiếu loại, danh mục hoặc ngày; schema Mongoose giới hạn `type` và `paymentMethod` theo danh sách cố định.
   - Form có tích hợp sẵn cụm nút *"Thử nghiệm Validate Nhanh"* để giảng viên kiểm chứng tức thì.
2. **Xác thực & bảo mật mật khẩu:**
   - Mật khẩu được băm bằng `scrypt` với salt ngẫu nhiên, so sánh bằng `timingSafeEqual`.
   - Token gồm user id, thời hạn và chữ ký HMAC-SHA256; server kiểm tra chữ ký, thời hạn và sự tồn tại của user trước khi cho ghi dữ liệu. Khi nhận 401, giao diện tự xóa token và mở lại popup đăng nhập.
3. **Xử lý ngày tháng:**
   - Ngày giao dịch lưu dạng chuỗi `YYYY-MM-DD` và lọc theo tháng bằng tiền tố `YYYY-MM`, tránh lỗi lệch giao dịch qua ngày mới do múi giờ.
4. **Event-Driven Message Queue (mô phỏng RabbitMQ):**
   - Việc kiểm tra ngân sách được tách khỏi luồng lưu giao dịch qua exchange, queue và worker. Hàng đợi chạy trong tiến trình Node.js, không dùng RabbitMQ thật.
5. **Nén ảnh phía client:**
   - Ảnh Locket được vẽ lại bằng `canvas`, cạnh dài tối đa 800px, xuất JPEG chất lượng 0.82 rồi lưu base64 trong MongoDB.

---

## 6. Bảng Phân công (4 Thành viên)

Theo yêu cầu chấm thi của Giảng viên: Mỗi thành viên dùng tài khoản GitHub cá nhân của mình để commit các phần tương ứng, lịch sử commit khớp với phân công.

| STT | Thành viên | GitHub | Nhiệm vụ chính | Files phụ trách chính | Đóng góp |
|---|---|---|---|---|---|
| 1 | **Nguyễn Yến Nhi - 24100372** | `Nhi231` | Khởi tạo repo, cấu hình backend Express, Data Models, CRUD Giao dịch & Validation | `server.ts`, `src/types.ts`, `src/services/api.ts`, `package.json` | **25%** |
| 2 | **Hoàng Nhật Bảo Trâm - 24100260** | `hnbtram` | Giao diện chính React 19, Header, thẻ tổng quan, Form thêm/sửa giao dịch, Cụm nút demo kiểm tra lỗi, Danh sách giao dịch & Xuất CSV, Đăng ký / đăng nhập & Welcome Page, Tích hợp MongoDB | `src/App.tsx`, `src/components/Header.tsx`, `OverviewCards.tsx`, `TransactionModal.tsx`, `TransactionList.tsx`, `AuthModal.tsx`, `WelcomePage.tsx`, `src/services/auth.ts`, `src/utils/constants.ts` | **25%** |
| 3 | **Nguyễn Thuỳ Dương - 24107946** | `Ntduog1109` | Biểu đồ SVG Donut & Bar Chart, Module Ngân sách, Dạng xem Lịch Chi tiêu & Lưu trữ ảnh Locket | `src/components/CalendarView.tsx`, `LocketGalleryView.tsx`, `PhotoDetailModal.tsx`, `ChartsView.tsx`, `BudgetView.tsx` | **25%** |
| 4 | **Nguyễn Thị Kim Oanh - 24100459** | `Oanh2202` | AI Gemini & NLP Parser, Message Queue Event Monitor, Cửa sổ báo cáo & kiểm thử, Slide & Báo cáo | `src/components/AIQuickEntry.tsx`, `QueueMonitorModal.tsx`, `DefenseHubModal.tsx`, `README.md` | **25%** |

---

## 7. Hạn chế hiện tại

- Giao dịch và ngân sách chưa gắn với từng tài khoản (chưa có `userId`), các tài khoản dùng chung dữ liệu.
- Các API đọc dữ liệu, `POST /api/budgets`, `/api/ai/classify`, `/api/queue` và `/api/reset` chưa yêu cầu đăng nhập. `/api/reset` xóa toàn bộ giao dịch và ngân sách, chỉ dùng khi demo.
- Khi không có `GEMINI_API_KEY` hoặc Gemini báo lỗi, AI trả kết quả mặc định (số tiền 0, danh mục "Khác") để người dùng tự điền.
- `/api/stats` đang trả `dailyStats` rỗng nên biểu đồ cột Thu vs Chi theo ngày hiện trạng thái trống; biểu đồ Donut và các thẻ tổng quan hoạt động bình thường.
- `/api/test/run` chưa trả danh sách test case đúng cấu trúc mà cửa sổ báo cáo cần.
- Chưa có chức năng đổi mật khẩu và quên mật khẩu.
