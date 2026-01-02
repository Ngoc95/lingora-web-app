# Auth Module Documentation

## 1. Overview
Module này quản lý việc xác thực (Authentication) và phân quyền (Authorization) của người dùng trong hệ thống. Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** với cặp Access Token và Refresh Token.

- **Access Token**: Dùng để truy cập các resource được bảo vệ. Hạn dùng ngắn (mặc định cấu hình trong .env, thường là 15-30 phút). Gửi kèm trong Header `Authorization: Bearer <token>`.
- **Refresh Token**: Dùng để lấy Access Token mới khi cái cũ hết hạn. Hạn dùng dài (7 ngày). Được lưu và gửi tự động qua **Cookie** (`httpOnly`).

---

## 2. Models (Entities)

### 2.1. User
Bảng chính lưu thông tin người dùng.

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | number | User ID | Primary Key |
| `username` | text | Tên đăng nhập | Unique, 5-20 chars, chỉ chứa chữ và số |
| `email` | varchar | Email | Unique, valid email format |
| `password` | varchar | Mật khẩu đã mã hóa (bcrypt) | Bắt buộc, >= 6 chars, có chữ hoa |
| `roles` | Role[] | Danh sách quyền (Roles) | Many-to-Many (e.g. LEARNER, ADMIN) |
| `status` | enum | Trạng thái tài khoản | `INACTIVE`, `ACTIVE`, `SUSPENDED`, `BANNED`, `DELETED`. Default: `INACTIVE` |
| `proficiency` | enum | Trình độ | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, v.v. |
| `avatar` | varchar | URL ảnh đại diện | Default 'N/A' |
| `suspendedUntil`| timestamp| Thời hạn bị khóa tạm thời | Nullable |
| `banReason` | text | Lý do bị khóa | Nullable |

### 2.2. RefreshToken
Bảng lưu refresh token để quản lý user sessions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Token ID |
| `refreshToken` | varchar | Chuỗi token |
| `user` | User | Người sở hữu token |

### 2.3. VerificationToken
Bảng lưu các mã OTP/Code xác thực (Email, Reset Password).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | ID |
| `code` | string | Mã xác thực (OTP) |
| `type` | enum | Loại token (`emailVerifyToken`, `resetPasswordToken`) |
| `user` | User | User liên quan |

---

## 3. API Endpoints

**Base URL**: `/auth`

### 3.1. Register (Đăng ký)
Tạo tài khoản mới. Mặc định role là `LEARNER`. Sau khi đăng ký thành công, hệ thống tự động đăng nhập (trả về token).

- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "username": "nguyenvanA",
      "email": "a@example.com",
      "password": "Password123"
  }
  ```
- **Response (201 Created)**:
  - **Body**:
    ```json
    {
        "message": "Register successfully",
        "metadata": {
            "user": { ...user info (no password)... },
            "accessToken": "ey..."
        }
    }
    ```
  - **Cookie**: `refreshToken` (HttpOnly)

### 3.2. Login (Đăng nhập)
Đăng nhập bằng Username hoặc Email.

- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "identifier": "username_or_email",
      "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  - **Body**:
    ```json
    {
        "message": "Login successfully",
        "metadata": {
            "user": { ... },
            "accessToken": "ey..."
        }
    }
    ```
  - **Cookie**: `refreshToken` (HttpOnly)

### 3.3. Refresh Token (Lấy Access Token mới)
Dùng khi Access Token hết hạn. Client gọi API này để lấy Access Token mới mà không cần đăng nhập lại.

- **URL**: `/refresh-token`
- **Method**: `POST`
- **Cookie Required**: `refreshToken`
- **Response (200 OK)**:
  - **Body**:
    ```json
    {
        "message": "Refresh token successfully",
        "metadata": {
            "accessToken": "ey_new_access_token..."
        }
    }
    ```
  - **Cookie**: Update `refreshToken` mới.

### 3.4. Logout (Đăng xuất)
Xóa refresh token trong DB và xóa cookie ở client.

- **URL**: `/logout`
- **Method**: `POST`
- **Cookie Required**: `refreshToken`
- **Response (200 OK)**:
  ```json
  {
      "message": "Logged out successfully"
  }
  ```

### 3.5. Get Current User Profile (Me)
Lấy thông tin người dùng hiện tại dựa trên Access Token.

- **URL**: `/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer <access_token>`
- **Response (200 OK)**:
  ```json
  {
      "message": "Get profile successfully",
      "metadata": {
          "id": 1,
          "username": "...",
          "email": "...",
          "roles": [...],
          ...
      }
  }
  ```

---

## 4. Feature Flows (Quy trình nghiệp vụ)

### 4.1. Email Verification (Xác thực tài khoản)
Dùng để kích hoạt tài khoản (`status` chuyển từ `INACTIVE` -> `ACTIVE`).

#### a. Request OTP
Gửi mã OTP về email của user đang đăng nhập.

- **URL**: `/email-verification/request`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{"message": "Send verification email successful!"}`

#### b. Verify OTP
Gửi mã OTP để xác thực.

- **URL**: `/email-verification/verify`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
  ```json
  {
      "code": "123456"
  }
  ```
- **Response**: Trả về thông tin user mới nhất (đã active).

### 4.2. Forgot Password (Quên mật khẩu)
Quy trình gồm 3 bước: Yêu cầu -> Xác thực Code -> Đổi mật khẩu.

#### Step 1: Request Password Reset
Gửi yêu cầu reset pass, hệ thống gửi mã code về email.

- **URL**: `/password-reset/request`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "email": "user@example.com"
  }
  ```
- **Response**: `{"message": "Send change password code successful!"}`

#### Step 2: Verify Code
Kiểm tra mã code người dùng nhập. Nếu đúng, trả về một **resetToken** (một JWT tàm thời dùng riêng cho việc đổi pass).

- **URL**: `/password-reset/verify`
- **Method**: `POST`
- **Query Params**: `code=123456`
- **Body**:
  ```json
  {
      "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
      "message": "Code verified successfully!",
      "metadata": {
          "resetToken": "ey_special_reset_token..."
      }
  }
  ```

#### Step 3: Confirm New Password
Dùng `resetToken` từ Step 2 để đổi mật khẩu mới.

- **URL**: `/password-reset/confirm`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `Bearer <resetToken>` (Lưu ý: Dùng resetToken, không phải accessToken của user)
- **Body**:
  ```json
  {
      "newPassword": "NewPassword123"
  }
  ```
- **Response**: `{"message": "Password reset successfully"}`. (Sau bước này, user cần đăng nhập lại với mật khẩu mới).

---

## 5. Error Handling
Các lỗi chung thường gặp:

- **400 Bad Request**: Dữ liệu gửi lên sai format, thiếu trường, sai logic (ví dụ password ngắn, email không hợp lệ).
  ```json
  {
      "status": "error",
      "code": 400,
      "message": "Message cụ thể lỗi",
      "stack": "..."
  }
  ```
- **401 Unauthorized**: Token hết hạn, token sai, không có token.
  ```json
  {
      "status": "error",
      "code": 401,
      "message": "Access token expired. / Access token is invalid."
  }
  ```
- **403 Forbidden**: User không có quyền truy cập resource (Role không đủ).
