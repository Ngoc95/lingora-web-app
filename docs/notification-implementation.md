# 📋 Flow Implement Notification Feature
---

## 🎯 Phase 1: Phân tích 

### 1.1 Nghiên cứu Backend API
```bash
# Đọc documentation hoặc code backend
- Endpoint nào để fetch notifications? → GET /notifications
- Endpoint nào để mark as read? → PATCH /notifications/:id
- Response structure như thế nào? → { metaData: {...} }
- Có Socket.IO không? Event name gì? → "notification"
```

### 1.2 Xem Mobile App (nếu có)
```bash
# Học từ mobile app để hiểu business logic
- UI trông như thế nào?
- Navigation logic ra sao?
- Có những loại notification nào?
```

---

## 🏗️ Phase 2: Setup Types & Infrastructure 

### 2.1 Tạo Type Definitions
```typescript
// src/types/notification.ts

// Step 1: Copy enums từ backend
export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  // ... copy hết từ backend
}

// Step 2: Define interfaces
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  data: any; // Sẽ chứa postId, studySetId, etc. tùy theo backend
  isRead: boolean;
  createdAt: string;
}

// Step 3: Define API response
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  currentPage: number;
  totalPages: number;
  unreadCount: number;
}
```

**Checklist:**
- [ ] Tạo file `src/types/notification.ts`
- [ ] Copy enums từ backend
- [ ] Define interfaces cho Notification
- [ ] Define interfaces cho API responses

### 2.2 Tạo API Service
```typescript
// src/services/notification.service.ts

class NotificationService {
  // Step 1: Implement fetch
  async getNotifications(params) {
    const response = await api.get('/notifications', params);
    return response.metaData; // Chú ý structure!
  }
  
  // Step 2: Implement mark as read
  async markAsRead(id) {
    await api.patch(`/notifications/${id}`);
  }
  
  // Step 3: Implement navigation logic
  getNavigationUrl(notification) {
    // Logic phức tạp nhất - cần test kỹ!
    // Chú ý: Frontend route ≠ Backend API route
    // Ví dụ: Frontend /forum/21 vs Backend /posts/21
  }
}
```

**Checklist:**
- [ ] Tạo file `src/services/notification.service.ts`
- [ ] Implement `getNotifications()`
- [ ] Implement `markAsRead()`
- [ ] Implement `getNavigationUrl()` - **quan trọng nhất!**
- [ ] Test từng function với Postman/console

### 2.3 Tạo Socket Service (real-time)
```typescript
// src/services/socket.service.ts

class SocketService {
  connect(token, baseUrl) {
    this.socket = io(baseUrl, { auth: { token } });
    
    this.socket.on('notification', (notif) => {
      // Notify listeners
    });
  }
  
  onNotification(callback) {
    this.listeners.push(callback);
    return () => { /* unsubscribe */ };
  }
}
```

**Checklist:**
- [ ] Install `socket.io-client`
- [ ] Tạo `src/services/socket.service.ts`
- [ ] Implement connect/disconnect
- [ ] Implement event listeners
- [ ] Test connection với backend

---

## 🎨 Phase 3: Build UI Components

### 3.1 Tạo Custom Hook
```typescript
// src/hooks/useNotifications.ts

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch on mount
  useEffect(() => {
    // ⚠️ SSR Safety: Check window trước
    if (typeof window === 'undefined') return;
    fetchNotifications();
  }, []);
  
  // Connect socket
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    socketService.connect(token, baseUrl);
    socketService.onNotification((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  }, []);
  
  return { notifications, unreadCount, loadMore, markAsRead };
}
```

**Checklist:**
- [ ] Tạo `src/hooks/useNotifications.ts`
- [ ] Implement state management
- [ ] Implement fetch logic
- [ ] Implement Socket.IO integration
- [ ] **Add SSR safety checks** (`typeof window !== 'undefined'`)

### 3.2 Build Components (Bottom-up approach)

#### Step 1: NotificationItem (Component nhỏ nhất)
```typescript
// src/components/shared/NotificationItem.tsx

export function NotificationItem({ notification, onClick }) {
  const Icon = getNotificationIcon(notification.type);
  
  return (
    <div onClick={onClick}>
      <Icon className={getIconColor(notification.type)} />
      <p>{notification.message}</p>
      <span>{formatDistanceToNow(notification.createdAt)}</span>
      {!notification.isRead && <div className="blue-dot" />}
    </div>
  );
}
```

**Checklist:**
- [ ] Tạo component
- [ ] Implement icon mapping (type → icon)
- [ ] Implement color coding
- [ ] Format timestamp với `date-fns`
- [ ] Add unread indicator
- [ ] Test với mock data

#### Step 2: NotificationList (Container)
```typescript
// src/components/shared/NotificationList.tsx

export function NotificationList({ 
  notifications, 
  onLoadMore,
  error 
}) {
  // Error state
  if (error && notifications.length === 0) {
    return <ErrorState message={error} />;
  }
  
  // Empty state
  if (notifications.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <>
      {notifications.map(n => <NotificationItem {...} />)}
      {hasMore && <LoadMoreButton onClick={onLoadMore} />}
    </>
  );
}
```

**Checklist:**
- [ ] Tạo component
- [ ] Implement empty state
- [ ] Implement error state
- [ ] Implement loading state
- [ ] Add "Load more" button
- [ ] Test với mock data

#### Step 3: NotificationDropdown (Popover wrapper)
```typescript
// src/components/shared/NotificationDropdown.tsx

export function NotificationDropdown({ children }) {
  const { notifications, markAsRead, error } = useNotifications();
  const router = useRouter();
  
  const handleClick = async (notif) => {
    // Mark as read
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    
    // Navigate
    const url = notificationService.getNavigationUrl(notif);
    if (url) {
      router.push(url);
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList 
          notifications={notifications}
          error={error}
          onNotificationClick={handleClick}
        />
      </PopoverContent>
    </Popover>
  );
}
```

**Checklist:**
- [ ] Install Radix UI Popover (nếu chưa có)
- [ ] Tạo component
- [ ] Integrate với `useNotifications` hook
- [ ] Implement click handler (mark as read + navigate)
- [ ] Test open/close behavior

#### Step 4: NotificationBell (Entry point)
```typescript
// src/components/shared/NotificationBell.tsx

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  
  return (
    <NotificationDropdown>
      <Button title="Thông báo">
        <Bell />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
        )}
      </Button>
    </NotificationDropdown>
  );
}
```

**Checklist:**
- [ ] Tạo component
- [ ] Add badge với unread count
- [ ] Integrate với dropdown
- [ ] **Không dùng Tooltip** (conflict với Popover)
- [ ] Test trong header

---

## 🔗 Phase 4: Integration

### 4.1 Add to Layout
```typescript
// src/components/layout/UserTopBar.tsx

import { NotificationBell } from '@/components/shared/NotificationBell';

export function UserTopBar() {
  return (
    <header>
      {/* ... */}
      <NotificationBell />
      <UserMenu />
    </header>
  );
}
```

**Checklist:**
- [ ] Import NotificationBell
- [ ] Add vào header (UserTopBar, AdminTopBar)
- [ ] Remove hardcoded count props
- [ ] Check responsive design
- [ ] Test trên mobile

---

## 🐛 Phase 5: Debug & Fix Issues

### Common Issues & Solutions

#### Issue 1: Dropdown không mở
```typescript
// ❌ Problem: Tooltip conflict với Popover
<Tooltip>
  <TooltipTrigger asChild>
    <Popover>
      <PopoverTrigger asChild>
        <Button />

// ✅ Solution: Remove Tooltip, chỉ giữ Popover
<Popover>
  <PopoverTrigger asChild>
    <Button title="Thông báo" /> {/* Native tooltip */}
```

#### Issue 2: SSR Hydration Error
```typescript
// ❌ Problem: localStorage on server
useEffect(() => {
  const token = localStorage.getItem('token');
});

// ✅ Solution: Check window
useEffect(() => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
});
```

#### Issue 3: 401 Unauthorized
```bash
# Check:
1. Backend route có middleware authentication không?
   → Xem notification.route.ts có accessTokenValidation
2. Token có được gửi kèm request không?
   → Check Network tab, xem Authorization header
3. Token có expired không?
   → Backend sẽ auto refresh nếu có refresh token
```

#### Issue 4: Navigation sai URL
```typescript
// ❌ Wrong: Backend API route
return `/posts/${id}`; // Backend API endpoint

// ✅ Correct: Frontend route
return `/forum/${id}`; // Frontend page route

// Lưu ý: Frontend route ≠ Backend API route!
```

#### Issue 5: API Response Structure
```typescript
// Backend trả về:
{
  message: "Success",
  metaData: { notifications: [...] }
}

// ❌ Wrong
return response.data; // undefined!

// ✅ Correct
return response.metaData;
```

**Debug checklist:**
- [ ] Check browser console logs
- [ ] Check network tab (API calls)
- [ ] Check Socket.IO connection status
- [ ] Test với real data từ backend
- [ ] Test error cases (401, 404, empty, etc.)

---

## ✅ Phase 6: Testing & Polish

### 6.1 Manual Testing
```bash
Test cases:
1. ✅ Click bell → dropdown mở
2. ✅ Click notification → navigate đúng trang
3. ✅ Mark as read → UI update (background đổi màu, dot biến mất)
4. ✅ Load more → fetch thêm data
5. ✅ Real-time → notification mới xuất hiện tự động
6. ✅ Empty state → hiển thị "Chưa có thông báo"
7. ✅ Error state → hiển thị lỗi khi API fail
8. ✅ Loading state → hiển thị spinner
9. ✅ Unread count → badge update real-time
10. ✅ Responsive → hoạt động tốt trên mobile
```

### 6.2 Code Review Checklist
- [ ] Code có comments đầy đủ?
- [ ] TypeScript types đúng?
- [ ] Error handling đầy đủ?
- [ ] Loading states có không?
- [ ] Empty states có không?
- [ ] Responsive design OK?
- [ ] Performance OK? (không re-render nhiều)
- [ ] SSR safety checks đầy đủ?
- [ ] No console errors?

---

## 📝 Tổng kết Timeline

| Phase | Time | Tasks |
|-------|------|-------|
| 1. Phân tích | 30 min | Đọc backend, mobile app |
| 2. Setup | 1h | Types, services, socket |
| 3. UI Components | 2-3h | Hook, components |
| 4. Integration | 1h | Add to layout |
| 5. Debug | 2-3h | Fix issues |
| 6. Testing | 1h | Manual test, polish |
| **Total** | **7-9h** | **Full feature** |

---

**Created:** 2026-01-11  
**Author:** Lingora Development Team  
**Version:** 1.0
