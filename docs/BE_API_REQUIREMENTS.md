# Backend API Requirements - Landing Page

## API cần implement

### 1. `GET /api/public/statistics`
**Mô tả**: Lấy số liệu thống kê hiển thị trên landing page.

**Response**:
```json
{
  "users": 10234,
  "courses": 523,
  "words": 52341,
  "tests": 1089
}
```

**Lưu ý**: 
- Đây là API public, không cần authentication
- Có thể cache response (TTL: 1 hour)
- Format hiển thị: số lớn sẽ được format với "+" (10,000+)

---

### 2. `GET /api/public/testimonials` (Optional)
**Mô tả**: Lấy danh sách testimonials/reviews từ học viên.

**Response**:
```json
{
  "testimonials": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "role": "Sinh viên",
      "avatar": "https://...",
      "content": "Lingora giúp tôi cải thiện..."
    }
  ]
}
```

**Lưu ý**:
- API public, không cần authentication
- Limit 3-6 testimonials
- Có thể dùng static content nếu không muốn quản lý trong DB

---

## Current Hardcoded Values (FE)

```typescript
const STATS = {
  users: "10,000+",
  courses: "500+", 
  words: "50,000+",
  tests: "1,000+",
};

const TESTIMONIALS = [
  { name: "Nguyễn Văn A", role: "Sinh viên", content: "..." },
  { name: "Trần Thị B", role: "Nhân viên văn phòng", content: "..." },
  { name: "Lê Văn C", role: "Giáo viên", content: "..." },
];
```

---

## Priority
- **P0**: Statistics API (cần để hiển thị số liệu thực)
- **P1**: Testimonials API (có thể dùng static content tạm)
