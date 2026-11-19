# Thiệp Mời Tân Gia - bản đã tối ưu

## Cấu trúc
- `index.html`: giao diện chính, triển khai GitHub Pages.
- `Code.gs`: API nhận RSVP, tự tạo sheet `RSVP` và tiêu đề cột.
- `index1-reference.html`: bản giao diện cũ để đối chiếu, không dùng làm trang chính.

## Cấu hình Google Apps Script
1. Mở Google Sheet dùng để lưu xác nhận.
2. Vào Extensions → Apps Script, thay nội dung `Code.gs` bằng file trong gói này.
3. Deploy → New deployment → Web app.
4. Execute as: Me. Who has access: Anyone (nếu muốn khách không cần đăng nhập Google).
5. Deploy và sao chép URL `/exec` vào biến `SCRIPT_URL` ở đầu phần JavaScript trong `index.html`.
6. Nếu đã có deployment cũ, cần cập nhật deployment sang phiên bản mới sau khi sửa Code.gs.

## Triển khai GitHub Pages
Đưa `index.html` lên thư mục gốc của repository, bật Settings → Pages → Deploy from branch.

## Cá nhân hóa thiệp
- Tên khách: thêm query string `?ten=Nguyen%20Van%20A` vào URL.
- Thời gian: sửa `EVENT_DATE`.
- Địa chỉ: sửa `EVENT_ADDRESS` và nội dung địa chỉ hiển thị trong HTML.

## Lưu ý
Chế độ gửi hiện dùng `no-cors`, vì vậy trình duyệt không đọc được phản hồi của Google Apps Script. Trang chỉ báo đã gửi yêu cầu, không khẳng định chắc chắn dữ liệu đã được ghi. Kiểm tra sheet `RSVP` sau khi gửi thử. Thông tin ngày/giờ/địa chỉ đang giữ theo dữ liệu có trong bộ code gốc; cần xác nhận lại trước khi phát hành thiệp.
