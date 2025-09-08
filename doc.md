# Chú ý

- Không được động vào file server.js

- Những package không thể thiếu trong dự án: `npm i morgan --save-dev`, `npm i helmet --save-dev`, `npm i compression --save-dev`
  - morgan: in ra các log khi người dùng gửi request
  - helmet: Nó là cái mũ bảo hiểm để ngăn chặn lộ thông tin. Ngăn bên thứ 3 truy cập vào. Ví dụ: khi hacker tấn công vào nó sẽ nhìn header của chúng ta coi chúng ta đang xài công nghệ để mà tấn công
  - compression: Giảm thiểu băng thông cho chúng ta
- Nguyên tắc không được nhúng con số nào vô code hết
- Không cần đóng kết nối server liên tục.

## PoolSize

- PoolSize: cải thiện hiệu suất, khả năng mở rộng.
- Nếu vượt quá kết nối PoolSize: thì mongoose sẽ cho kết nối phải xếp hàng đợi thằng phía trước xử lí xong rồi mới tới lượt mình.
- PoolSize này dựa trên tài nguyên sẵn có trên máy tính (CPU, RAM, ...). Vì vậy, khi mở rộng chúng ta phải để ý tới tài nguyên của mình và test connect PoolSize

## routes

- file access trong routes
  - thì nó sẽ làm về signIn, signUp
  - Lưu access token, refresh token

# Ghi chú quan trọng về Authentication & Token

Tài liệu này tổng hợp các best practices về việc xử lý mật khẩu và token trong các hệ thống hiện đại.

## 1. Lưu trữ Mật khẩu: Luôn luôn Hashing + Salt

Đây là quy tắc nền tảng và bắt buộc khi xử lý thông tin đăng nhập của người dùng.

- **Nguyên tắc vàng:** **Không bao giờ lưu mật khẩu gốc (plaintext)** trong database.
- **Công cụ đúng:** Dùng **thuật toán Hashing một chiều**. Hashing là quá trình không thể đảo ngược, giống như "máy xay sinh tố", bạn không thể biến sinh tố trở lại thành trái cây ban đầu.
- **Bắt buộc phải có Salt:** **Salt** là một chuỗi ngẫu nhiên được tạo ra cho mỗi người dùng và ghép vào mật khẩu của họ _trước khi_ hash. Salt giúp chống lại các cuộc tấn công dò tìm mật khẩu bằng Rainbow Table.
- **Thuật toán nên dùng:**
  - 🏆 **Argon2:** (Khuyến nghị hàng đầu) Hiện đại, mạnh mẽ, chiến thắng cuộc thi Password Hashing Competition.
  - ✅ **Bcrypt:** Tiêu chuẩn vàng trong nhiều năm, rất đáng tin cậy.
- **Thuật toán cần TRÁNH:**
  - ❌ **MD5**, **SHA-1**: Đã lỗi thời và không còn an toàn.

**Luồng xử lý:** `password + salt -> Thuật toán Hash (Argon2/Bcrypt) -> hashed_password`
**Lưu trong DB:** `{userId, username, hashed_password, salt}`

---

## 2. Token Authentication: JWT (JSON Web Token)

Sau khi người dùng đăng nhập, chúng ta cấp cho họ một "vé thông hành" (token) để truy cập các tài nguyên được bảo vệ. JWT là tiêu chuẩn phổ biến nhất. Có hai cách để bảo vệ (ký) JWT:

### 2.1. Phương pháp Đối xứng (Symmetric - HS256)

- **Cơ chế:** Dùng chung **một `SECRET_KEY`** cho cả việc tạo và xác thực token.
- **Analogy:** Giống như "mật khẩu Wi-Fi", ai có mật khẩu thì đều có toàn quyền.
- **Khi nào dùng:** Phù hợp cho các ứng dụng **Monolith** đơn giản, nơi chỉ có một service duy nhất tạo và xác thực token.
- **Rủi ro:** Nếu `SECRET_KEY` bị lộ, kẻ tấn công có thể tự tạo ra token hợp lệ.

### 2.2. Phương pháp Bất đối xứng (Asymmetric - RS256) - Best Practice

- **Cơ chế:** Dùng một cặp key. Đây là phương pháp **an toàn và linh hoạt hơn**.

- **PrivateKey (Khóa Bí Mật 🤫):**

  - **Vai trò:** Dùng để **KÝ (SIGN)** token.
  - **Lưu trữ:** **GIỮ BÍ MẬT TUYỆT ĐỐI** và không bao giờ được rời khỏi dịch vụ xác thực (Auth Server).
  - **Analogy:** Chỉ giám đốc mới có cây bút để ký văn bản.

- **PublicKey (Khóa Công Khai 📢):**
  - **Vai trò:** Dùng để **XÁC THỰC (VERIFY)** chữ ký của token.
  - **Lưu trữ:** Có thể **CHIA SẺ CÔNG KHAI** cho bất kỳ service nào cần kiểm tra token.
  - **Analogy:** Mẫu chữ ký của giám đốc được phát cho các phòng ban để đối chiếu.

---

## 3. Bảng tổng kết & Lựa chọn

| Tiêu chí      | Đối xứng (HS256)        | Bất đối xứng (RS256)   |
| :------------ | :---------------------- | :--------------------- |
| **Bảo mật**   | Trung bình              | 🏆 **Cao**             |
| **Kiến trúc** | Monolith                | 🏆 **Microservices**   |
| **Cơ chế**    | Dùng chung 1 Secret Key | Cặp Public/Private Key |

**Kết luận của Mentor:** Với các hệ thống hiện đại, đặc biệt là kiến trúc Microservices (như dự án Capstone E-commerce của chúng ta), sử dụng **thuật toán bất đối xứng (RS256) là lựa chọn tiêu chuẩn và an toàn nhất.**
