# 🚀 HƯỚNG DẪN DEPLOY CHI TIẾT WHIP-API LÊN ORACLE VPS (ARM64)

Tài liệu này hướng dẫn chi tiết từng bước để bạn deploy ứng dụng **Whip API** lên VPS Oracle Cloud (chạy Ubuntu 24.04 LTS, kiến trúc CPU ARM64 - `aarch64`) bằng **Docker** và cấu hình **Nginx Reverse Proxy + SSL (HTTPS)**.

---

## 📌 TỔNG QUAN HỆ THỐNG
* **VPS IP:** `217.142.190.230`
* **Hệ điều hành:** Ubuntu 24.04 LTS (ARM64)
* **API Port mặc định:** `8017`
* **Môi trường chạy:** Docker & Docker Compose
* **Database:** MongoDB Atlas (đã cấu hình online, không cần cài MongoDB trên VPS)
* **Domain API mong muốn:** (Ví dụ: `api.whip.cobweb.id.vn`)
* **Domain Frontend:** `https://whip.cobweb.id.vn` (Deploy trên Vercel)

---

## 🛠 BƯỚC 1: CÀI ĐẶT DOCKER & DOCKER COMPOSE TRÊN VPS

Đăng nhập vào VPS của bạn qua SSH và chạy các lệnh sau để cài đặt Docker Engine mới nhất:

```bash
# 1. Cập nhật danh sách gói hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt các gói phụ trợ cần thiết
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Thêm khóa GPG chính thức của Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Thiết lập kho lưu trữ (repository) của Docker cho Ubuntu
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cài đặt Docker Engine và Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Khởi động và cho phép Docker tự khởi động cùng hệ thống
sudo systemctl enable docker
sudo systemctl start docker

# 7. Kiểm tra phiên bản cài đặt thành công
docker --version
docker compose version
```

---

## 🔒 BƯỚC 2: CẤU HÌNH FIREWALL (TƯỜNG LỬA) - CỰC KỲ QUAN TRỌNG TRÊN ORACLE VPS

Oracle VPS có **2 lớp tường lửa**. Nếu không mở cả 2 lớp, bạn sẽ **không thể truy cập** được API từ ngoài Internet.

### Lớp 1: Cấu hình trên trang quản trị Oracle Cloud (Web Dashboard)
1. Truy cập vào **Oracle Cloud Console** -> **Virtual Cloud Networks**.
2. Chọn VCN của bạn -> Chọn **Security Lists** tương ứng với Subnet của VPS.
3. Nhấp vào **Default Security List** -> Chọn **Add Ingress Rules**.
4. Thêm các Rule sau:
   - **Rule 1 (HTTP):** Source CIDR: `0.0.0.0/0` | IP Protocol: `TCP` | Destination Port Range: `80`
   - **Rule 2 (HTTPS):** Source CIDR: `0.0.0.0/0` | IP Protocol: `TCP` | Destination Port Range: `443`
   - **Rule 3 (Nếu muốn test API trực tiếp qua cổng 8017):** Source CIDR: `0.0.0.0/0` | IP Protocol: `TCP` | Destination Port Range: `8017`

### Lớp 2: Cấu hình tường lửa cục bộ bên trong OS Ubuntu (iptables)
Mặc định hệ điều hành Ubuntu của Oracle chặn tất cả các cổng kết nối ngoại trừ cổng SSH (22). Hãy chạy các lệnh sau trong VPS để mở cổng:

```bash
# Cho phép lưu lượng truy cập qua các cổng 80, 443 và 8017
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 8017 -j ACCEPT

# Lưu cấu hình iptables để không bị mất khi restart VPS
sudo netfilter-persistent save
sudo netfilter-persistent reload
```

---

## 📂 BƯỚC 3: ĐƯA MÃ NGUỒN LÊN VPS

Có 2 cách chính để bạn đưa code lên VPS. Hãy chọn cách thuận tiện nhất cho bạn:

### Cách 1: Sử dụng Git (Khuyên dùng cho môi trường Production)
Đẩy code của bạn lên GitHub/GitLab (ở chế độ Private), sau đó clone về VPS:

```bash
# Di chuyển đến thư mục home hoặc thư mục bạn muốn chứa project
cd ~

# Clone project (Nếu là repo private, bạn có thể dùng SSH Key hoặc Personal Access Token)
git clone <URL_REPOSITOY_CỦA_BẠN> whip-api

# Di chuyển vào thư mục code
cd whip-api
```

### Cách 2: Sử dụng SFTP (Kéo thả qua Client như Termius / MobaXterm)
1. Bạn nhìn thấy tab **SFTP** trên thanh menu của ứng dụng SSH của bạn.
2. Kết nối SFTP vào VPS (thường dùng user `ubuntu`, port `22` và file SSH Key `.key` / `.pem`).
3. Truy cập thư mục `/home/ubuntu/`.
4. Tạo thư mục mới tên là `whip-api` và kéo thả toàn bộ các file từ máy cá nhân lên thư mục này.
5. ⚠️ **LƯU Ý QUAN TRỌNG:** **KHÔNG** upload thư mục `node_modules` từ máy Windows của bạn lên VPS. Hệ điều hành Windows và Linux ARM64 có kiến trúc khác nhau, việc cài đặt thư mục `node_modules` sẽ được Docker tự động tải và biên dịch trực tiếp trên VPS trong quá trình build image để đảm bảo tương thích 100%.

---

## ⚙️ BƯỚC 4: CẤU HÌNH FILE MÔI TRƯỜNG `.env` TRÊN VPS

1. Tại thư mục `/home/ubuntu/whip-api` trên VPS, tạo file `.env` bằng cách copy từ file ví dụ:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` để chỉnh sửa cấu hình:
   ```bash
   nano .env
   ```
3. Điền đầy đủ thông tin môi trường của bạn (sử dụng các phím mũi tên để di chuyển, nhập giá trị thực tế của bạn):
   ```env
    # Database kết nối MongoDB Atlas
    MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.zpeucpc.mongodb.net/?appName=Cluster0'
    DATABASE_NAME='whip-app'

    # Cấu hình Host & Port cho Production
    PORT=8017
    BUILD_MODE=production

    # Domain của ứng dụng frontend (dùng để cấu hình CORS và link trong email kích hoạt/reset pass)
    WEBSITE_DOMAIN_PRODUCTION='https://whip.cobweb.id.vn'

    # JWT Signature
    ACCESS_TOKEN_SECRET_SIGNATURE='<your-access-token-secret-signature>'
    ACCESS_TOKEN_LIFE='1h'
    REFRESH_TOKEN_SECRET_SIGNATURE='<your-refresh-token-secret-signature>'
    REFRESH_TOKEN_LIFE='14 days'

    # Cloudinary (Quản lý hình ảnh tải lên)
    CLOUDINARY_CLOUD_NAME='<your-cloudinary-cloud-name>'
    CLOUDINARY_API_KEY='<your-cloudinary-api-key>'
    CLOUDINARY_API_SECRET='<your-cloudinary-api-secret>'

    # Brevo API Key gửi email
    BREVO_API_KEY='<your-brevo-api-key>'
    ADMIN_EMAIL_ADDRESS='<your-admin-email>'
    ADMIN_EMAIL_NAME='<your-admin-name>'
   ```
4. Nhấn `Ctrl + O` -> `Enter` để lưu lại file, nhấn `Ctrl + X` để thoát trình soạn thảo `nano`.

---

## 🐳 BƯỚC 5: BUILD VÀ CHẠY ỨNG DỤNG BẰNG DOCKER COMPOSE

Vì VPS của bạn chạy chip ARM64 (aarch64), lệnh build Docker sẽ tự động biên dịch ứng dụng tương thích hoàn hảo với CPU này.

```bash
# 1. Build image từ Dockerfile
sudo docker compose build --no-cache

# 2. Khởi chạy container chạy ngầm (detached mode)
sudo docker compose up -d

# 3. Xem logs thời gian thực để kiểm tra xem server đã khởi động và kết nối MongoDB thành công chưa
sudo docker compose logs -f whip-api
```
*(Nếu muốn thoát màn hình theo dõi logs, nhấn `Ctrl + C` - ứng dụng vẫn sẽ tiếp tục chạy ngầm).*

---

## 🌐 BƯỚC 6: CÀI ĐẶT NGINX REVERSE PROXY & SSL (HTTPS) CHO DOMAIN API

Hiện tại, API của bạn đang chạy ở cổng `8017`. Để biến nó thành một API chuyên nghiệp chạy dưới tên miền có bảo mật HTTPS (ví dụ: `https://api.whip.cobweb.id.vn`), bạn cần cấu hình Nginx.

### 1. Trỏ Domain về IP VPS
Truy cập trang quản lý DNS tên miền của bạn (`cobweb.id.vn`), tạo một bản ghi **A Record**:
* **Name (Host):** `api` (hoặc tên phụ khác bạn muốn đặt cho API)
* **Value (Points to):** `217.142.190.230`

### 2. Cài đặt Nginx trên VPS
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Cấu hình Nginx cho API
Tạo file cấu hình cấu hình proxy cho domain API:
```bash
sudo nano /etc/nginx/sites-available/whip-api
```

Dán nội dung sau vào file (thay thế `api.whip.cobweb.id.vn` bằng subdomain thực tế của bạn):
```nginx
server {
    listen 80;
    server_name api.whip.cobweb.id.vn;

    location / {
        proxy_pass http://localhost:8017;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cấu hình timeout cho Socket.io nếu cần kết nối lâu dài
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```
Lưu lại (`Ctrl + O`, `Enter`, `Ctrl + X`).

### 4. Kích hoạt cấu hình và restart Nginx
```bash
# Tạo liên kết đến thư mục sites-enabled để kích hoạt cấu hình
sudo ln -s /etc/nginx/sites-available/whip-api /etc/nginx/sites-enabled/

# Kiểm tra cú pháp cấu hình Nginx xem có lỗi không
sudo nginx -t

# Reload lại Nginx
sudo systemctl reload nginx
```

### 5. Cài đặt SSL (HTTPS) miễn phí với Certbot Let's Encrypt
```bash
# Cài đặt Certbot và plugin Nginx
sudo apt install certbot python3-certbot-nginx -y

# Tiến hành đăng ký chứng chỉ SSL cho domain
sudo certbot --nginx -d api.whip.cobweb.id.vn

# Trả lời các câu hỏi: nhập email của bạn, đồng ý điều khoản (A), và đồng ý chia sẻ email (Y/N tùy ý).
# Certbot sẽ tự động thay đổi file cấu hình Nginx để kích hoạt HTTPS.
```

Sau khi hoàn tất, bạn đã có thể truy cập API tại địa chỉ: `https://api.whip.cobweb.id.vn` cực kỳ bảo mật!

---

## 💻 BƯỚC 7: CẬP NHẬT TRÊN FRONTEND (`WHIP-APP`)

Để ứng dụng frontend có thể giao tiếp được với server backend mới trên VPS:

1. Mở file [constants.js](file:///c:/Users/phanb\Desktop\Workspace\Project\whip-app\src\utils\constants.js#L6-L8) trên máy cá nhân của bạn.
2. Thay đổi URL của API cho môi trường production từ Render cũ sang domain VPS mới của bạn:
   ```javascript
   if (process.env.BUILD_MODE === 'production') {
     apiRoot = 'https://api.whip.cobweb.id.vn' // Thay đổi thành domain của bạn vừa cài ở Nginx
   }
   ```
3. Commit và push code của Frontend lên Github để Vercel tự động build lại phiên bản mới nhất.

---

## 🔄 CÁC LỆNH HỮU ÍCH KHI QUẢN TRỊ TRÊN VPS

Khi ứng dụng đã chạy, nếu bạn thay đổi code backend và muốn cập nhật lên VPS:

```bash
# Cập nhật code mới từ Git về VPS
git pull

# Rebuild lại docker container để nhận code mới nhất
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d

# Xem log kiểm tra lỗi
sudo docker compose logs -f whip-api
```

Chúc bạn deploy dự án thành công tốt đẹp! 🎉
