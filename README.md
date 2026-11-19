# THIỆP MỜI MANAGER V2

Hệ thống tạo và vận hành nhiều thiệp trên cùng một bộ code: Tân gia, Đám cưới, Sinh nhật, Khai trương và Sự kiện công ty. Frontend chạy GitHub Pages; dữ liệu sự kiện và RSVP lưu trong Google Sheets; Google Apps Script làm API.

## 1. Cấu trúc
- `index.html`: mẫu thiệp dùng chung, tự nạp nội dung theo mã sự kiện.
- `Code.gs`: API, tự tạo sheet `Events` và `RSVP`, đọc sự kiện, ghi RSVP.
- `Events-template.csv`: mẫu cột để thêm nhiều sự kiện.
- `index1-reference.html`: giao diện cũ được giữ để tham khảo.

## 2. Cài đặt lần đầu
1. Tạo một Google Spreadsheet mới.
2. Mở **Extensions → Apps Script**, thay nội dung `Code.gs` bằng file trong gói.
3. Chọn hàm `setup` và chạy một lần, cấp quyền. Hệ thống tự tạo hai sheet `Events`, `RSVP`; nếu `Events` đang trống sẽ thêm một sự kiện Tân gia mẫu theo dữ liệu trong code gốc (20/12/2026, 11:00, địa chỉ Phú Nhuận). Hãy kiểm tra và sửa dữ liệu mẫu trước khi gửi thiệp.
4. Chọn **Deploy → New deployment → Web app**; Execute as: **Me**; Who has access: **Anyone** để khách không cần đăng nhập Google.
5. Sao chép URL Web App kết thúc bằng `/exec`.
6. Trong `index.html`, thay `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` bằng URL vừa sao chép.
7. Đưa `index.html` lên repository GitHub, bật **Settings → Pages**.

## 3. Tạo thêm sự kiện
Mỗi sự kiện là một dòng trong sheet `Events`. Không cần sửa code hay tạo trang HTML mới. Sao chép một dòng rồi thay các cột:

| Cột | Nội dung |
|---|---|
| EventID | Mã duy nhất, không dấu, ví dụ `CUOI-ANH-LAN-2027` |
| Type | `housewarming`, `wedding`, `birthday`, `opening`, `corporate` |
| Title | Tiêu đề lớn trên thiệp |
| Host | Tên gia chủ/cặp đôi/đơn vị |
| Subtitle | Dòng phụ, ví dụ “Trân trọng kính mời” |
| EventDate | ISO, ví dụ `2027-03-20T17:30:00+07:00` |
| EndDate | ISO kết thúc; có thể để trống |
| Address | Địa chỉ hiển thị |
| MapURL | Link Google Maps; có thể để trống |
| Message | Lời mời / nội dung chính |
| Theme | `classic`, `wedding`, `birthday`, `opening`, `corporate` |
| Active | `TRUE` để hiển thị, `FALSE` để tắt |
| CreatedAt | Ngày tạo, có thể để trống khi thêm tay |

## 4. Gửi thiệp cá nhân hóa
- Thiệp sự kiện: `https://TEN-USER.github.io/TEN-REPO/?event=TAN-GIA-20261220`
- Gửi riêng cho khách: `https://TEN-USER.github.io/TEN-REPO/?event=TAN-GIA-20261220&ten=Nguyen%20Van%20A`
- Nếu bỏ `event`, trang lấy sự kiện đang hoạt động đầu tiên trong sheet `Events`.
- RSVP được ghi vào sheet `RSVP`, kèm EventID để phân biệt khách của từng sự kiện.

## 5. Loại thiệp và giao diện
- Tân gia: `housewarming` / `classic`
- Đám cưới: `wedding` / `wedding`
- Sinh nhật: `birthday` / `birthday`
- Khai trương: `opening` / `opening`
- Sự kiện công ty: `corporate` / `corporate`

Các mẫu hiện dùng chung bố cục, màu sắc thay đổi theo `Theme`. Có thể mở rộng thêm theme và nội dung theo từng loại trong `index.html` mà không thay đổi dữ liệu RSVP.

## 6. Cập nhật phiên bản Apps Script
Sau khi sửa `Code.gs`, vào **Deploy → Manage deployments → Edit → New version → Deploy**. URL `/exec` thường giữ nguyên khi cập nhật deployment hiện có.

## 7. Lưu ý kỹ thuật và bảo mật
- Web App phải được triển khai quyền truy cập phù hợp để khách mở thiệp và gửi RSVP.
- Trang dùng JSONP cho thao tác đọc thông tin sự kiện; chỉ đưa dữ liệu công khai của sự kiện vào `Events`.
- Gửi RSVP dùng `fetch` với `no-cors` để tương thích Apps Script cross-origin. Trình duyệt không đọc được phản hồi thực của máy chủ; thông báo trên trang chỉ xác nhận đã gửi yêu cầu, không phải bằng chứng ghi thành công. Ban tổ chức cần kiểm tra sheet `RSVP`.
- Không lưu thông tin nhạy cảm của khách trong `Events` hoặc URL. Tên khách trên URL có thể xuất hiện trong lịch sử trình duyệt và log chia sẻ.
- Đây là bản nền tảng V2: quản trị sự kiện bằng Google Sheets. Chưa có màn hình quản trị đăng nhập riêng, QR check-in, gửi Zalo/email hàng loạt hoặc phân quyền nhiều tài khoản.
