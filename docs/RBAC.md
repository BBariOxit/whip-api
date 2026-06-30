# Role-Based Access Control (RBAC) - Whip App

Tài liệu này định nghĩa các quy tắc phân quyền cho hệ thống Whip (bao gồm Workspace và Board). Dùng làm kim chỉ nam để xây dựng các middleware phân quyền (RBAC) trong API. Bộ từ vựng được quy hoạch chuẩn theo Form của Trello/Asana/Jira để tránh gây "lú" cho người dùng cuối.

---

## 1. TẦNG 1: WORKSPACE (Cấp độ Công ty / Tòa nhà)

### 1.1. Workspace Owner (Chủ sở hữu)
**Bản chất:** Thằng đẻ ra cái Workspace này. Nó là chúa tể. Nó nắm quyền Billing (trả tiền mướn app).
**Quyền hạn (Permissions):**
- **Toàn quyền tối cao:** Kế thừa mọi quyền của Workspace Admin.
- **Quyền độc tôn:** Là người duy nhất có quyền Xóa sổ hoàn toàn Workspace (Delete Workspace).
- **Bất khả xâm phạm:** Không ai có quyền đuổi (kick) hoặc giáng cấp Owner.

### 1.2. Workspace Admin (Quản trị viên)
**Bản chất:** Cánh tay phải của Owner (Ví dụ: Giám đốc nhân sự).
**Quyền hạn (Permissions):**
- **Cấu hình Workspace:** Đổi tên, thay đổi thông tin mô tả.
- **Quản lý Nhân sự:** 
  - Mời người mới vào Workspace (thông qua Email hoặc Link).
  - Xóa (Kick) một Workspace Member khỏi Workspace (Khi bị kick, member tự động bay màu khỏi TẤT CẢ các Board thuộc Workspace này).
  - Phân quyền: Thăng cấp Workspace Member lên Admin, hoặc giáng cấp Admin xuống Member.
- **Quyền lực trên Board:**
  - **Tự động có toàn quyền (ngang Board Manager)** đối với tất cả các Board có Visibility là `Workspace Visible` hoặc `Public` trong Workspace đó.
  - **TUYỆT ĐỐI KHÔNG THỂ** xem, truy cập hoặc thao tác trên các Board `Private` nếu không được mời đích danh. (Bị chặn ở cấp độ API - trả về 403).
**Giới hạn:**
- KHÔNG được xóa Workspace.
- KHÔNG được đá đít (kick) hoặc giáng cấp Owner.

### 1.3. Workspace Member (Thành viên)
**Bản chất:** Nhân viên bình thường.
**Quyền hạn (Permissions):**
- **Tài nguyên:** Tạo Board mới bên trong Workspace (Khi tạo, tự động trở thành Board Manager của Board đó).
- **Truy cập:** Xem, tham gia và tương tác với các Board ở chế độ `Workspace Visible` hoặc `Public`.
- **Thông tin:** Xem danh sách các thành viên khác trong Workspace.
- **Cá nhân:** Tự rời khỏi Workspace (Leave Workspace).
**Giới hạn (Nghiêm cấm):**
- Không được đổi tên, chỉnh sửa cấu hình hay xóa Workspace.
- Không được mời hoặc kick bất kỳ ai khỏi Workspace.
- Không được thay đổi quyền (Role) của người khác trong Workspace.

---

## 2. TẦNG 2: BOARD (Cấp độ Dự án / Phân xưởng)

### 2.1. Board Manager (Quản đốc)
**Bản chất:** Người tạo ra Board (bất kể role ở Workspace là gì) HOẶC được giao làm Leader của dự án đó.
**Quyền hạn (Permissions):**
- **Quản lý Cấu trúc:** Tạo, Sửa, Kéo thả, Lưu trữ (Archive) và **Xóa vĩnh viễn (Delete)** bất kỳ Column và Card nào trong Board.
- **Quản lý Nhân sự:** 
  - Mời thêm thành viên (từ danh sách Workspace) vào dự án này.
  - Xóa (Remove) thành viên ra khỏi Board.
  - Phân quyền: Đổi role cho user trong Board (Ví dụ: nâng Editor lên Manager, hạ Manager xuống Editor/Observer).
- **Cấu hình Board:** 
  - Đổi tên, đổi ảnh nền / màu nền Board.
  - Đổi chế độ hiển thị (Visibility): `Public`, `Workspace Visible`, `Private`.
- **Hủy diệt:** Lưu trữ (Archive) toàn bộ Board hoặc Xóa vĩnh viễn (Delete) Board.

### 2.2. Board Editor (Người chỉnh sửa / Thợ xây)
**Bản chất:** Thành viên được thêm vào làm việc trực tiếp trong dự án.
**Quyền hạn (Permissions):**
- **Thao tác Card:** 
  - Tạo mới Card.
  - Kéo thả Card.
  - Comment, thêm Nhãn (Label), Đính kèm file (Attachment), tạo/sửa Checklist trong Card.
  - Cập nhật nội dung (Title, Description, Due Date) của Card.
- **Cá nhân:** Tự rời khỏi Board (Leave Board).
**Giới hạn (Nghiêm cấm):**
- KHÔNG được sửa đổi cấu trúc Cột (Column). Không được tạo hay xóa Column.
- KHÔNG được đổi tên, thay nền hay thiết lập Visibility của Board.
- KHÔNG được mời/đuổi ai ra khỏi Board, không được phân quyền.
- KHÔNG được Archive hoặc Xóa Board.
- *(Nghiệp vụ thực tế)*: Không được phép Xóa vĩnh viễn (Hard Delete) Card. Nếu có nhầm lẫn, Editor chỉ được phép Lưu trữ (Archive).

### 2.3. Board Observer (Người quan sát / Khách)
**Bản chất:** Khách hàng (Client) hoặc Sếp tổng rảnh rỗi vào ngó.
**Quyền hạn (Permissions):**
- Chỉ được **Xem (Read-only)** nội dung Board.
- Chỉ được **Comment** vào các thẻ.
**Giới hạn (Nghiêm cấm):**
- Cấm tuyệt đối việc kéo thả làm xê dịch thẻ của anh em đang làm việc.
- Không được tạo thẻ mới, không sửa cấu trúc bất cứ thứ gì.

---

## 3. Trận chiến tối cao & Các trường hợp ngoại lệ (Edge Cases)

### 3.1. Phân giải Quyền lợi Board Visibility
- **`Private` (Bí mật):** Chỉ những thành viên CÓ TRONG DANH SÁCH `board_members` mới nhìn thấy và truy cập được. Sếp (Workspace Owner/Admin) nếu không có trong danh sách thì coi như Board này không tồn tại. Nếu Workspace bị xóa => Board Private chết theo.
- **`Workspace Visible` (Nội bộ công ty):** Bất kỳ ai trong Workspace đều có thể thấy. Workspace Owner/Admin tự động Bypass mọi quyền, có thể nhảy vào sửa/xóa Board này như một Board Manager mà không cần được Invite.
- **`Public` (Công khai):** Bất kỳ ai có URL (kể cả Guest chưa đăng nhập) đều có thể xem (Read-only). Tuy nhiên, chỉ những người có trong danh sách `board_members` mới được tương tác tùy theo role (Editor/Manager).

### 3.2. Hiệu ứng Domino khi bị Kick (Cascade)
- Khi một user bấm **"Leave Workspace"** hoặc bị Admin **"Kick khỏi Workspace"**, Backend bắt buộc phải chạy logic ngầm (Background Job / Trigger / Cascade) để gỡ user đó ra khỏi TẤT CẢ các Board thuộc Workspace đó ngay lập tức.

---
## 4. Hướng dẫn cho Developer (Backend Middleware)

Dựa vào bộ quy tắc này, Backend nên cấu trúc 2 lớp Middleware chính:
1. `requireWorkspaceAccess(role_level)`: 
   - Kiểm tra xem user có đạt role tối thiểu không (Ví dụ: cần role `Admin` trở lên để mời người, role `Owner` để xóa Workspace).
2. `requireBoardAccess(action_type)`:
   - Nếu `action_type = "read"`:
     - Board là `Public` => Pass.
     - Board là `Workspace Visible` => Check user có thuộc Workspace chứa Board này không => Pass.
     - Board là `Private` => Check user có trong `board_members` không => Pass.
   - Nếu `action_type = "edit_card"`:
     - Check user có role `Editor` hoặc `Manager` trong `board_members` không.
   - Nếu `action_type = "admin_actions"` (sửa tên bảng, xóa bảng, quản lý cột, quản lý user):
     - Check user có role `Manager` trong bảng `board_members` không.
     - HOẶC (Trường hợp siêu năng lực): Nếu Board là `Workspace Visible` và user là `Owner` hoặc `Admin` của cái Workspace chứa Board này => Pass.
