<div align="center">

# 💰 FinTrack

**Ứng dụng Quản lý Chi tiêu Cá nhân Thông minh (Personal Finance Tracker)**

*Ghi chép thu/chi nhanh chóng · Trực quan hóa dòng tiền · Cảnh báo chủ động*

<br/>

> 🌐 **Trải nghiệm ứng dụng (Live Demo):** [https://fintrack-personal-finance-7b52.onrender.com/](https://fintrack-personal-finance-7b52.onrender.com/)

<br/>

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Claude](https://img.shields.io/badge/Code_Support-Claude_AI-D97757?style=flat-square)

**Môn học:** Lập trình Web Nâng cao  
**Đề tài:** Ứng dụng Quản lý Chi tiêu Cá nhân

</div>

---

## 1. Giới thiệu

**FinTrack** là ứng dụng full-stack hỗ trợ người dùng (sinh viên, nhân viên văn phòng) ghi chép thu/chi hàng ngày, trực quan hóa dòng tiền và cảnh báo chủ động khi chi tiêu vượt hạn mức ngân sách tháng.

Dự án minh họa kiến trúc **Event-Driven** (hướng sự kiện) kết hợp **Microservices pattern** (mô phỏng Message Queue), xác thực bảo mật đa tầng, và tích hợp Trí tuệ Nhân tạo (AI Gemini) vào quy trình nhập liệu.

🌐 **Link Website (Demo):** [https://fintrack-personal-finance-7b52.onrender.com/](https://fintrack-personal-finance-7b52.onrender.com/)

> 🤖 **Ghi chú:** Quá trình phát triển, viết và tối ưu hóa các file mã nguồn trong dự án có sự hỗ trợ đắc lực từ **Claude AI**.

### ✨ Điểm nổi bật

- 🔐 **Bảo mật & Phân quyền** — Băm mật khẩu `scrypt`, token HMAC-SHA256, dữ liệu tách biệt theo từng User.
- 📸 **Locket Moments** — Đính kèm ảnh hóa đơn, nén ảnh tự động ≤ 800px phía client.
- 📅 **Calendar View** — Xem chi tiêu theo từng ngày trong tháng trực quan.
- 🤖 **AI Gemini** — Nhập chi tiêu bằng ngôn ngữ tự nhiên, AI tự bóc tách số tiền & danh mục.
- 🐇 **Message Queue** — Xử lý kiểm tra ngân sách bất đồng bộ (mô phỏng RabbitMQ).
- 🛡️ **Defense Mode** — Cụm nút thử nghiệm validate dành riêng cho Giảng viên chấm thi.

### 🚀 Tính năng chi tiết

1. **Tài khoản & Xác thực:** Trang Welcome, Đăng ký/Đăng nhập (Email & Mật khẩu).
2. **CRUD Giao dịch:** Thêm/sửa/xóa, tìm kiếm, sắp xếp, xuất CSV. Đính kèm ảnh Locket (nén 800px, JPEG 0.82).
3. **Dạng xem Lịch:** Lịch biểu chi tiết từng ngày, trực quan hóa thu (+) / chi (−).
4. **Locket Moments:** Thư viện ảnh chi tiêu dạng widget sinh động.
5. **Thống kê:** Biểu đồ tròn Donut, thẻ tổng quan số dư, tỷ lệ tiết kiệm.
6. **Ngân sách:** Đặt hạn mức tổng & từng danh mục. Thanh tiến độ (Xanh <80%, Vàng 80-100%, Đỏ ≥100%).
7. **AI Gemini:** Nhập tự nhiên (VD: *"Ăn trưa 50k"*), AI tự bóc tách số tiền & danh mục.
8. **Message Queue:** Mô phỏng RabbitMQ, xử lý event bất đồng bộ.

---

## 2. Hướng dẫn cài đặt & Khởi chạy nhanh

**Yêu cầu:** Node.js 20+ và cụm MongoDB (Atlas).

### Bước 1 — Cài đặt thư viện

```bash
git clone https://github.com/hnbtram/fintrack-personal-finance.git
cd fintrack-personal-finance
npm install
```

### Bước 2 — Cấu hình `.env`

Tạo file `.env` ở thư mục gốc:

```env
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
AUTH_SECRET=<chuoi-bi-mat-ngau-nhien-dai>
GEMINI_API_KEY=<khong-bat-buoc>
```

| 🔑 Biến | Bắt buộc | 📝 Ghi chú |
|:---|:---:|:---|
| `MONGO_URI` | ✅ | Chuỗi kết nối MongoDB |
| `AUTH_SECRET` | ⚠️ | Khóa ký token (Nên có) |
| `GEMINI_API_KEY`| ❌ | Dùng cho tính năng nhập nhanh bằng AI |
| `PORT` | ❌ | Mặc định `8080` |

### Bước 3 — Khởi chạy

```bash
npm run dev
```

Ứng dụng sẽ khởi động tại: **`http://localhost:8080`**

---

## 3. Kiến trúc Hệ thống

<p align="center">
  <img width="3200" height="2220" alt="fintrack-architecture" src="https://github.com/user-attachments/assets/ea1cd18a-0187-4003-b800-5c4c6bdd1920" />
</p>

**Luồng xử lý sự kiện tạo giao dịch:**
1. Lưu giao dịch vào MongoDB (kèm `userId`).
2. Phát event `transaction.created` vào `transaction-exchange`.
3. Budget Worker tiếp nhận, so sánh chi tiêu với ngân sách của User đó.
4. Ghi kết quả vào `budget-evaluation-queue` (nếu trong hạn mức) hoặc `notification-queue` (nếu vượt).

---

## 4. Danh sách REST API

| Method | Endpoint | Auth | Mô tả |
|:---:|:---|:---:|:---|
| `GET` | `/api/health` | ❌ | Kiểm tra trạng thái server & MongoDB |
| `POST` | `/api/auth/register` | ❌ | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | ❌ | Đăng nhập, nhận token |
| `GET` | `/api/auth/me` | ✅ | Lấy thông tin user hiện tại |
| `GET` | `/api/transactions` | ✅ | Lấy danh sách giao dịch (lọc theo tháng, loại, search) |
| `POST` | `/api/transactions` | ✅ | Tạo giao dịch mới (phát event Queue) |
| `PUT` | `/api/transactions/:id` | ✅ | Cập nhật giao dịch |
| `DELETE` | `/api/transactions/:id` | ✅ | Xóa giao dịch |
| `GET` | `/api/budgets` | ✅ | Lấy danh sách ngân sách & tiến độ của user |
| `POST` | `/api/budgets` | ✅ | Thiết lập/Cập nhật ngân sách |
| `GET` | `/api/stats` | ✅ | Thống kê số dư, tỷ lệ tiết kiệm, biểu đồ |
| `POST` | `/api/ai/classify` | ❌ | AI phân tích câu lệnh ngôn ngữ tự nhiên |
| `GET` | `/api/queue` | ❌ | Xem log Message Queue |
| `GET` | `/api/test/run` | ❌ | Dữ liệu cho cửa sổ báo cáo kiểm thử |
| `POST` | `/api/reset` | ❌ | Reset dữ liệu mẫu (Dùng khi demo) |

---

## 5. Kỹ thuật nổi bật & Phục vụ phản biện

| Kỹ thuật | Chi tiết triển khai |
|:---|:---|
| **Validation đa tầng** | Client báo lỗi thời gian thực (số âm, nhập chữ). Server trả `HTTP 400` nếu dữ liệu sai. Tích hợp cụm nút "Thử nghiệm Validate Nhanh". |
| **Bảo mật** | Mật khẩu dùng `scrypt` + salt, so sánh `timingSafeEqual`. Token HMAC-SHA256 (hạn 7 ngày). Dữ liệu gắn chặt với `userId`. |
| **Xử lý ngày tháng** | Lưu dạng `YYYY-MM-DD` và lọc theo `YYYY-MM` để tránh lỗi lệch múi giờ. |
| **Nén ảnh Locket** | Dùng HTML5 `canvas` resize cạnh dài ≤ 800px, xuất JPEG 0.82, lưu Base64. |
| **Message Queue** | Mô phỏng RabbitMQ chạy in-process, tách biệt luồng lưu giao dịch và kiểm tra ngân sách. |

---

## 6. Bảng Phân công (4 Thành viên)

| STT | Thành viên | Nhiệm vụ chính | Đóng góp |
|:---:|:---|:---|:---:|
| 1 | **Nguyễn Yến Nhi**<br/>`24100372` | Khởi tạo repo, cấu hình backend Express, Data Models, CRUD Giao dịch & Validation | **25%** |
| 2 | **Hoàng Nhật Bảo Trâm**<br/>`24100260` | Giao diện chính React 19, Header, thẻ tổng quan, Form thêm/sửa giao dịch, Cụm nút demo kiểm tra lỗi, Danh sách giao dịch & Xuất CSV, Tích hợp MongoDB | **25%** |
| 3 | **Nguyễn Thuỳ Dương**<br/>`24107946` | Biểu đồ SVG Donut & Bar Chart, Module Ngân sách, Dạng xem Lịch Chi tiêu & Lưu trữ ảnh Locket | **25%** |
| 4 | **Nguyễn Thị Kim Oanh**<br/>`24100459` | AI Gemini & NLP Parser, Message Queue Monitor, Cửa sổ báo cáo & kiểm thử, **Đăng ký / Đăng nhập / Trang chào mừng**, Slide & Báo cáo | **25%** |

<details>
<summary><b>📁 Xem chi tiết các Files phụ trách (Click để mở)</b></summary>

- **Thành viên 1 (Nhi):** `server.ts`, `src/types.ts`, `src/services/api.ts`, `package.json`
- **Thành viên 2 (Trâm):** `src/App.tsx`, `Header.tsx`, `OverviewCards.tsx`, `TransactionModal.tsx`, `TransactionList.tsx`, `constants.ts`
- **Thành viên 3 (Dương):** `CalendarView.tsx`, `LocketGalleryView.tsx`, `PhotoDetailModal.tsx`, `ChartsView.tsx`, `BudgetView.tsx`
- **Thành viên 4 (Oanh):** `AIQuickEntry.tsx`, `QueueMonitorModal.tsx`, `DefenseHubModal.tsx`, `AuthModal.tsx`, `WelcomePage.tsx`, `auth.ts`, `README.md`

</details>

---

## 7. Hạn chế hiện tại

- **API phụ chưa bảo vệ:** Các API `/api/ai/classify`, `/api/queue` và `/api/reset` hiện chưa yêu cầu đăng nhập (chỉ phục vụ mục đích demo).
- **Fallback AI:** Khi thiếu `GEMINI_API_KEY` hoặc Gemini lỗi, AI trả kết quả mặc định (số tiền `0`, danh mục `"Khác"`).
- **Biểu đồ cột:** `/api/stats` đang trả `dailyStats` rỗng nên biểu đồ cột theo ngày bị trống (Donut và thẻ tổng quan vẫn hoạt động tốt).
- **Test case:** `/api/test/run` chưa trả đúng cấu trúc dữ liệu cho cửa sổ báo cáo.
- **Tài khoản:** Chưa hỗ trợ đổi mật khẩu và quên mật khẩu.

<div align="center">
<br/>
<i>Made with ❤️ for Lập trình Web Nâng cao</i>
</div>
