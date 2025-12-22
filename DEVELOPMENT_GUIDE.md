# Lingora Web App - Developer Guide

Tài liệu hướng dẫn tích hợp API và phát triển UI cho dự án Lingora.

---

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── (auth)/           # Auth module - không có bottom nav
│   │   ├── login/
│   │   ├── register/
│   │   ├── otp/
│   │   └── adaptive-test/
│   ├── (user)/           # User module - có bottom nav + chatbot FAB
│   │   ├── vocabulary/
│   │   ├── learn/
│   │   ├── practice/
│   │   ├── study-sets/
│   │   ├── forum/
│   │   ├── dictionary/
│   │   ├── profile/
│   │   └── notifications/
│   └── admin/            # Admin module - có sidebar
│       ├── dashboard/
│       ├── users/
│       ├── categories/
│       ├── topics/
│       ├── words/
│       ├── exams/
│       ├── reports/
│       └── withdrawals/
├── components/
│   ├── layout/           # Layout components
│   ├── shared/           # Shared components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom hooks
├── lib/                  # Utilities
└── types/                # TypeScript types
```

---

## 🔐 Auth Module

### Routes & Components

| Route | Component | Mô tả | API cần tích hợp |
|-------|-----------|-------|------------------|
| `/login` | `LoginPage` | Đăng nhập email/password + Google | `POST /auth/login`, `POST /auth/google` |
| `/register` | `RegisterPage` | Đăng ký tài khoản mới | `POST /auth/register` |
| `/otp` | `OTPPage` | Xác thực OTP 6 số | `POST /auth/verify-otp`, `POST /auth/resend-otp` |
| `/adaptive-test` | `AdaptiveTestPage` | Bài kiểm tra trình độ | `POST /adaptive-test/submit` |

### TODO - Auth Module

```typescript
// src/app/(auth)/login/page.tsx
// Line ~55: TODO - Gọi API đăng nhập
const handleSubmit = async () => {
  // TODO: await authApi.login({ email, password });
};

// src/app/(auth)/register/page.tsx  
// Line ~30: TODO - Gọi API đăng ký
// TODO: await authApi.register({ username, email, password });

// src/app/(auth)/otp/page.tsx
// Line ~60: TODO - Gọi API xác thực OTP
// TODO: await authApi.verifyOtp({ email, otp });
// Line ~77: TODO - Gọi API gửi lại OTP
// TODO: await authApi.resendOtp({ email });
```

---

## 👤 User Module

### Routes & Components

| Route | Component | Mô tả | API cần tích hợp |
|-------|-----------|-------|------------------|
| `/vocabulary` | `VocabularyPage` | Danh sách categories | `GET /categories` |
| `/vocabulary/[categoryId]` | `CategoryPage` | Topics trong category | `GET /categories/:id/topics` |
| `/vocabulary/[categoryId]/[topicId]` | `TopicDetailPage` | Chi tiết topic + cấu hình học | `GET /topics/:id` |
| `/learn/[topicId]` | `LearnPage` | Game học từ vựng | `GET /topics/:id/words`, `POST /learn/progress` |
| `/practice` | `PracticePage` | Trang chủ luyện tập | `GET /practice/stats` |
| `/practice/tests` | `TestsPage` | Danh sách đề thi | `GET /exams` |
| `/study-sets` | `StudySetsPage` | Bộ học cá nhân | `GET /study-sets` |
| `/forum` | `ForumPage` | Diễn đàn | `GET /forum/posts` |
| `/dictionary` | `DictionaryPage` | Tra từ điển | `GET /dictionary/lookup?word=` |
| `/profile` | `ProfilePage` | Hồ sơ người dùng | `GET /users/me`, `GET /users/me/stats` |

### TODO - User Module

```typescript
// src/app/(user)/vocabulary/page.tsx
// TODO: Fetch categories từ API
// const categories = await categoryApi.getAll();

// src/app/(user)/learn/[topicId]/page.tsx
// TODO: Fetch words từ API
// const words = await topicApi.getWords(topicId, { count, games });
// TODO: Submit progress
// await learnApi.submitProgress({ topicId, score, wordsLearned });

// src/components/layout/user/ChatbotFAB.tsx
// Line ~50: TODO - Gọi API chatbot
// const response = await chatbotApi.sendMessage(input);
```

---

## 🛠 Admin Module

### Routes & Components

| Route | Component | Mô tả | API cần tích hợp |
|-------|-----------|-------|------------------|
| `/admin/dashboard` | `DashboardPage` | Thống kê tổng quan | `GET /admin/stats` |
| `/admin/users` | `UsersPage` | Quản lý người dùng | `GET /admin/users`, `PATCH /admin/users/:id` |
| `/admin/categories` | `CategoriesPage` | Quản lý danh mục | CRUD `/admin/categories` |
| `/admin/topics` | `TopicsPage` | Quản lý chủ đề | CRUD `/admin/topics` |
| `/admin/words` | `WordsPage` | Quản lý từ vựng | CRUD `/admin/words`, `POST /admin/words/import` |
| `/admin/exams` | `ExamsPage` | Quản lý đề thi | CRUD `/admin/exams`, `POST /admin/exams/import` |
| `/admin/reports` | `ReportsPage` | Báo cáo nội dung | `GET /admin/reports`, `PATCH /admin/reports/:id` |
| `/admin/withdrawals` | `WithdrawalsPage` | Yêu cầu rút tiền | `GET /admin/withdrawals`, `PATCH /admin/withdrawals/:id` |

---

## 🪝 Custom Hooks

### Đã triển khai

| Hook | File | Mô tả | Sử dụng |
|------|------|-------|---------|
| `useAuth` | `src/hooks/useAuth.ts` | Quản lý auth state | Login, logout, user info |
| `useFlashcard` | `src/hooks/useFlashcard.ts` | Flashcard flip/navigation | Trang học từ vựng |
| `useInfiniteScroll` | `src/hooks/useInfiniteScroll.ts` | Infinite scroll pagination | Danh sách dài |
| `useAudioPlayer` | `src/hooks/useAudioPlayer.ts` | Phát audio | Nghe phát âm từ |
| `useCountdown` | `src/hooks/useCountdown.ts` | Đếm ngược | Timer trong exam |

### Hook cần API integration

```typescript
// useAuth.ts - Cần tích hợp:
// - authApi.login()
// - authApi.register() 
// - authApi.logout()
// - authApi.refreshToken()
// - authApi.getCurrentUser()

// useInfiniteScroll.ts - Đã hoàn thiện, chỉ cần truyền fetchFn
```

---

## 🎨 Design System

### CSS Variables (định nghĩa trong globals.css)

```css
--primary-500: #22c55e;      /* Main green */
--primary-600: #16a34a;      /* Hover green */
--neutral-50: #fafafa;       /* Background */
--neutral-200: #e5e5e5;      /* Border */
--neutral-600: #525252;      /* Secondary text */
--neutral-900: #171717;      /* Primary text */
```

### Common Classes

```tsx
// Button Primary
className="rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] py-3 text-sm font-semibold text-white transition-all hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:shadow-lg"

// Button Secondary
className="rounded-lg border border-[var(--neutral-200)] bg-white py-3 text-sm font-medium text-[var(--neutral-900)] hover:bg-[var(--neutral-50)]"

// Input
className="w-full rounded-lg border border-[var(--neutral-200)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"

// Card
className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm"
```

---

## 📱 Responsive Breakpoints

```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
```

---

## 🔧 Công việc cần làm

### Priority 1 - API Integration

- [ ] Tạo API service layer (`src/services/api/`)
- [ ] Tích hợp auth APIs (login, register, OTP)
- [ ] Tích hợp user profile API
- [ ] Tích hợp vocabulary/topics APIs

### Priority 2 - State Management

- [ ] Setup Zustand store cho auth state
- [ ] Setup React Query cho data fetching
- [ ] Implement error handling global

### Priority 3 - Missing UI

- [ ] `/study-sets/[id]` - Chi tiết study set
- [ ] `/profile/edit` - Chỉnh sửa profile
- [ ] `/forum/[postId]` - Chi tiết bài viết
- [ ] `/practice/tests/[examId]` - Làm bài thi
- [ ] `/practice/tests/[examId]/result` - Kết quả thi
- [ ] `/notifications` - Thông báo

### Priority 4 - Features

- [ ] Form validation với Zod/React Hook Form
- [ ] Image/audio upload
- [ ] WebSocket cho chatbot realtime
- [ ] Push notifications

---

## 🚀 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## 📝 Notes

1. **Mock Data**: Tất cả data hiện tại là mock. Tìm `// TODO:` comments để biết nơi cần gọi API.

2. **Auth Layout**: Auth pages sử dụng layout riêng với logo Lingora ở trên.

3. **User Layout**: User pages có bottom navigation và ChatbotFAB.

4. **Admin Layout**: Admin có sidebar với menu collapse.

5. **Localization**: Tất cả text đã được Việt hóa.

---

*Cập nhật lần cuối: 22/12/2024*
