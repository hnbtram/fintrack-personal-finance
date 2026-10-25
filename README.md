# FinTrack - Ứng dụng Quản lý Chi tiêu Cá nhân Thông minh (Personal Finance Tracker)

> **Môn học:** Lập trình Web Nâng cao  
> **Đề tài:** Ứng dụng Quản lý Chi tiêu Cá nhân (Personal Finance Tracker)  
> **Điểm nổi bật:** Tích hợp mô hình AI Gemini (Phân loại tự động), Kiến trúc Event-Driven Message Queue (RabbitMQ Pattern), Validation chặt chẽ 2 lớp và Biểu đồ thống kê trực quan.

---

## 1. Giới thiệu & Bài toán giải quyết
- **Bài toán:** Hỗ trợ người dùng (sinh viên, nhân viên văn phòng) ghi chép thu/chi hàng ngày nhanh chóng, trực quan hóa dòng tiền và cảnh báo chủ động khi chi tiêu vượt hạn mức ngân sách tháng.
- **Tính năng chính:**
  1. **CRUD Giao dịch & Ảnh Locket:** Thêm, Sửa, Xóa giao dịch thu/chi với đầy đủ số tiền, danh mục, ngày giờ (GMT+7), ghi chú, phương thức thanh toán và **ảnh chụp/lưu trữ giống ứng dụng Locket (chụp ảnh hóa đơn, đĩa cơm trưa, cốc cà phê)**.
  2. **Dạng xem theo Lịch (Calendar View):** Hiển thị lịch biểu chi tiết từng ngày trong tháng, trực quan hóa số tiền thu (+) và chi (-) phát sinh trong ngày, kèm biểu tượng ảnh Locket và ngăn kéo chi tiết khi click vào từng ngày.
  3. **Locket Moments (Thư viện Ảnh Chi tiêu):** Tab riêng hiển thị toàn bộ những khoảnh khắc chi tiêu qua hình ảnh dạng widget Locket sinh động.
  4. **Thống kê & Biểu đồ trực quan:** Biểu đồ tròn Donut phân bổ tỷ trọng theo danh mục, biểu đồ cột so sánh Thu vs Chi theo từng ngày trong tháng, tính toán số dư ròng và tỷ lệ tiết kiệm (Savings Rate).
  5. **Đặt Ngân sách & Cảnh báo vượt hạn mức:** Thiết lập ngân sách tổng tháng và ngân sách cho từng danh mục, thanh đo tiến độ thời gian thực (Xanh lá <70%, Vàng cam 70-90%, Đỏ >90% hoặc vượt 100%).
  6. **Tích hợp AI Gemini 3.8 Flash (Điểm cộng):** Nhập văn bản tự nhiên như *"Ăn trưa 50k"*, *"Đổ xăng xe máy 70k"*, *"Nhận lương tháng 15 triệu"* → AI tự động trích xuất số tiền, phân loại đúng danh mục và điền trực tiếp vào hệ thống.
  7. **Mô phỏng Microservices / Message Queue (Điểm cộng):** Tách biệt Transaction Service và Worker xử lý ngân sách qua Topic Exchange, đẩy event vào `budget-evaluation-queue` và `notification-queue`.
  8. **Demo Kiểm tra lỗi (Defense Mode):** Nút thử nghiệm nhanh cho Giảng viên (Thử số tiền âm, thử nhập chữ cái, thử bỏ trống danh mục) minh họa cơ chế validate input cực chặt và xử lý lỗi HTTP 400.

---

## 2. Hướng dẫn cài đặt & Khởi chạy nhanh

Chỉ cần **1 lệnh duy nhất** để cài đặt và chạy ứng dụng:

```bash
npm install && npm run dev
```

Ứng dụng full-stack (gồm cả Backend Express REST API và Frontend React Vite) sẽ khởi động tại:
```
http://localhost:3000
```

---

## 3. Kiến trúc Hệ thống (Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                 │
│  - Plus Jakarta Sans, Tailwind CSS, Lucide Icons        │
│  - Interactive SVG Donut & Bar Charts                   │
│  - Client-side Realtime Input Validator                 │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST API (JSON)
┌──────────────────────────▼──────────────────────────────┐
│                  BACKEND (Node.js / Express)            │
│  - REST Controllers: /api/transactions, /api/budgets     │
│  - Strict Backend Validator (amount > 0, numeric, ISO)  │
│  - Timezone Normalizer (Asia/Ho_Chi_Minh GMT+7)         │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
┌────────────▼──────────────┐  ┌───────────▼──────────────┐
│     AI Model Service      │  │ Message Queue Simulation │
│  - Google GenAI SDK       │  │ - Topic Exchange         │
│  - Gemini 3.8 Flash       │  │ - Budget Evaluation Q    │
│  - JSON Schema Extraction │  │ - Notification Worker    │
└───────────────────────────┘  └──────────────────────────┘
```

---

## 4. Danh sách REST API chính

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ & kết nối AI |
| `GET` | `/api/transactions` | Lấy danh sách giao dịch (hỗ trợ lọc month, category, type, search) |
| `POST` | `/api/transactions` | Tạo mới giao dịch (validate chặt số tiền > 0, phát event sang Queue) |
| `PUT` | `/api/transactions/:id` | Cập nhật thông tin giao dịch |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch khỏi hệ thống |
| `GET` | `/api/budgets` | Lấy danh sách hạn mức và tiến độ chi tiêu % |
| `POST` | `/api/budgets` | Thiết lập hoặc cập nhật hạn mức ngân sách |
| `GET` | `/api/stats` | Thống kê số dư, tỷ lệ tiết kiệm và dữ liệu biểu đồ |
| `POST` | `/api/ai/classify` | AI phân tích ngôn ngữ tự nhiên thành entity giao dịch |
| `GET` | `/api/queue` | Xem trạng thái hàng đợi thông điệp và log của worker |
| `GET` | `/api/test/run` | Chạy bộ kiểm thử tự động (6/6 test cases) |
| `POST` | `/api/reset` | Khôi phục dữ liệu mẫu ban đầu để demo lại |

---

## 5. Kỹ thuật nổi bật & Phục vụ phản biện
1. **Validation 2 lớp cực chặt:**
   - Ngăn chặn triệt để số âm (`<= 0`), ký tự chữ (`NaN`), bỏ trống danh mục ngay tại giao diện và tại tầng controller backend (HTTP 400).
   - Form có tích hợp sẵn cụm nút *"Thử nghiệm Validate Nhanh"* để giảng viên kiểm chứng tức thì.
2. **Xử lý Múi giờ (Timezone isolation):**
   - Lưu chuẩn UTC timestamp trên server, quy đổi sang múi giờ `Asia/Ho_Chi_Minh` khi lọc theo tháng, tránh lỗi lệch giao dịch qua ngày mới.
3. **Bộ Test Runner Tự Động:**
   - Tích hợp tab kiểm thử tự động 1-click kiểm tra: Validate số âm, Validate chữ cái, Tính toán số dư, Event-driven Message Queue, AI Parsing.

---

## 6. Bảng Phân công & Lộ trình Commit GitHub (4 Thành viên)

Theo yêu cầu chấm thi của Giảng viên: Mỗi thành viên phải dùng tài khoản GitHub cá nhân của mình để commit các phần tương ứng, lịch sử commit khớp với phân công để đạt điểm tối đa tiêu chí **Kiểm thử & Đóng góp cá nhân (hệ số 1.0)**.

| STT | Thành viên | Nhiệm vụ chính | Files phụ trách chính | Đóng góp |
|---|---|---|---|---|
| 1 | **Thành viên 1** *(Trưởng nhóm)* | Khởi tạo repo, cấu hình backend Express, Data Models, CRUD Giao dịch & Validation 2 lớp | `server.ts`, `src/types.ts`, `src/services/api.ts`, `package.json` | **25%** |
| 2 | **Thành viên 2** | Giao diện chính React 19, Header, Form thêm/sửa giao dịch, Cụm nút demo kiểm tra lỗi, Danh sách giao dịch & Xuất CSV | `src/App.tsx`, `src/components/Header.tsx`, `src/components/TransactionModal.tsx`, `src/components/TransactionList.tsx`, `src/utils/constants.ts` | **25%** |
| 3 | **Thành viên 3** | Biểu đồ SVG Donut & Bar Chart, Module Ngân sách, Dạng xem Lịch Chi tiêu & Lưu trữ ảnh Locket | `src/components/CalendarView.tsx`, `src/components/LocketGalleryView.tsx`, `src/components/PhotoDetailModal.tsx`, `src/components/ChartsView.tsx`, `src/components/BudgetView.tsx` | **25%** |
| 4 | **Thành viên 4** | AI Gemini 3.8 Flash & NLP Parser, Message Queue Event Monitor (RabbitMQ), Test Suite Runner, Slide & Báo cáo | `src/components/AIQuickEntry.tsx`, `src/components/QueueMonitorModal.tsx`, `src/components/DefenseHubModal.tsx`, `README.md` | **25%** |

### 🚀 Thứ tự Commit từ đầu đến cuối:
1. **Bước 1 (Thành viên 1 bắt đầu):** Tạo repo GitHub, commit init project và backend foundation.
2. **Bước 2 (Thành viên 2):** Pull code về, commit UI Core (App, Header, Form giao dịch, Transaction List).
3. **Bước 3 (Thành viên 3):** Pull code về, commit Biểu đồ phân tích, Lịch chi tiêu Calendar và Ảnh Locket.
4. **Bước 4 (Thành viên 4):** Pull code về, commit AI Smart Parser, Message Queue Monitor, Automated Test Runner và tạo **Git Tag `final`** trước giờ nộp bài.
