# goodtrack: trang đăng ký dùng thử sớm

Trang tĩnh (HTML + CSS + JavaScript thuần, không cần build), giao diện theo template quangcaongocan: trời xanh, mây, thẻ kính mờ. Danh sách đăng ký được lưu vào Google Sheet qua Google Apps Script.

```
goodtrack/
├── index.html            Nội dung trang
├── styles.css            Giao diện
├── main.js               Form đăng ký (URL cấu hình ở dòng đầu)
├── favicon.svg, apple-touch-icon.png
├── clouds/            Mây 3D đã đóng gói (từ component mây của template), đừng sửa tay
├── tools/             sky.ts + build-clouds.mjs: nguồn và lệnh đóng gói lại mây
├── og.png                Ảnh xem trước khi dán link vào Facebook/Messenger (1200×630)
└── apps-script/
    ├── Code.gs           Dán vào Google Apps Script
    └── test.js           Kiểm tra Code.gs trên máy (không bắt buộc)
```

**Hosting: GitHub Pages.** Miễn phí, không cần tên miền, không cần cài gì: tải file lên qua trình duyệt là xong, link có dạng `https://<tên-github>.github.io/goodtrack/`. Trang này không có bước build nên không cần đến Netlify/Vercel.

---

## Bước 1: Tạo Google Sheet và Web App

1. Vào https://sheets.new để tạo một Google Sheet mới, đặt tên, ví dụ `goodtrack – Đăng ký`.
2. Trên thanh menu chọn **Tiện ích mở rộng → Apps Script** (tiếng Anh: *Extensions → Apps Script*).
3. Xóa hết code có sẵn trong `Code.gs`, mở file `apps-script/Code.gs` của dự án này, sao chép toàn bộ và dán vào. Bấm biểu tượng 💾 **Lưu**.
4. Bấm **Triển khai → Tùy chọn triển khai mới** (*Deploy → New deployment*).
5. Bấm biểu tượng bánh răng cạnh "Chọn loại", chọn **Ứng dụng web** (*Web app*), rồi điền:
   - **Thực thi với tư cách** (*Execute as*): **Tôi** (*Me*)
   - **Người có quyền truy cập** (*Who has access*): **Bất kỳ ai** (*Anyone*)
6. Bấm **Triển khai**. Google sẽ hỏi cấp quyền: chọn tài khoản → **Nâng cao** (*Advanced*) → **Đi tới ... (không an toàn)** → **Cho phép**. Đây là script của chính anh/chị nên an toàn.
7. Sao chép **URL ứng dụng web**, có dạng `https://script.google.com/macros/s/AKfy..../exec`.
8. Kiểm tra: dán URL đó vào trình duyệt. Nếu thấy `{"ok":true,"message":"goodtrack waitlist đang chạy"}` là đã đúng.

> Sau này nếu sửa `Code.gs`, phải vào **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Phiên bản mới → Triển khai** thì thay đổi mới có hiệu lực (URL giữ nguyên).

## Bước 2: Dán URL vào trang

Mở `main.js`, sửa dòng 4:

```js
const WAITLIST_URL = 'https://script.google.com/macros/s/AKfy..../exec';
```

## Bước 3: Đưa trang lên GitHub Pages

1. Tạo tài khoản tại https://github.com (nếu chưa có). Ghi nhớ **tên tài khoản**, ví dụ `nhasoc`.
2. Mở `index.html`, dùng Tìm & thay thế (Ctrl+H) để thay **tất cả** chữ `TEN-GITHUB` bằng tên tài khoản của anh/chị (nằm trong phần `<head>`, dùng cho ảnh xem trước Facebook). Cũng ở `index.html`, tìm và thay `TEN-INSTAGRAM`, `TEN-FACEBOOK`, `EMAIL@VIDU.COM` (mục Liên hệ) bằng thông tin thật. Link `goodtrack.vn/d/NS1024` và các tên trong ba màn hình điện thoại chỉ là ví dụ minh họa, sửa nếu anh/chị đã có tên miền thật.
3. Vào https://github.com/new, đặt **Repository name** là `goodtrack`, chọn **Public**, bấm **Create repository**.
4. Trên trang repo vừa tạo, bấm **uploading an existing file**, kéo thả **tất cả file và thư mục** của dự án (index.html, styles.css, main.js, og.png, favicon.svg, apple-touch-icon.png, các thư mục clouds, apps-script, tools) vào, bấm **Commit changes**.
5. Vào **Settings → Pages**. Ở mục **Branch** chọn `main` và `/ (root)`, bấm **Save**.
6. Chờ 1–2 phút, tải lại trang Settings → Pages sẽ thấy link: `https://<tên-github>.github.io/goodtrack/`.

Muốn sửa trang sau này: mở file trên GitHub → biểu tượng ✏️ → sửa → **Commit changes**, chờ khoảng 1 phút là trang cập nhật.

## Bước 4: Kiểm tra sau khi lên mạng

- Mở link trên điện thoại, điền form đăng ký bằng dữ liệu thử → phải hiện "Cảm ơn anh/chị…" và Sheet có thêm một dòng (tab **Đăng ký**, tự tạo ở lần gửi đầu tiên).
- Kiểm tra ảnh xem trước: dán link vào https://developers.facebook.com/tools/debug/ và bấm **Scrape Again**. Facebook lưu ảnh xem trước một thời gian, nên nếu đã từng dán link trước khi sửa `TEN-GITHUB` thì phải làm bước này.
- Xóa các dòng thử trong Sheet.

## Ghi chú kỹ thuật

- Form gửi bằng `fetch` POST dạng `application/x-www-form-urlencoded` nên không bị CORS preflight.
- Chống spam: ô ẩn `website` (honeypot). Có dữ liệu thì cả trang lẫn Apps Script đều bỏ qua nhưng vẫn báo "thành công" để bot không biết.
- Kiểm tra dữ liệu ở cả hai phía: tên shop bắt buộc (tối đa 100 ký tự); link phải là Instagram/Facebook/TikTok hoặc `@tenshop`. Biểu thức kiểm tra `SOCIAL_RE` có trong cả `main.js` và `Code.gs`, sửa thì sửa cả hai.
- Giá trị bắt đầu bằng `= + - @` được lưu dạng chữ để không bị chèn công thức vào Sheet.
- Mây 3D: dùng nguyên `scripts/clouds.ts` + `scripts/cloud-sky.ts` (three.js) của template quangcaongocan, đóng gói sẵn trong `clouds/`. Chỉ tải sau khi trang hiện xong và chỉ khi máy có GPU; máy yếu hoặc không có GPU thì chỉ thấy nền trời xanh. Muốn đóng gói lại (khi template đổi mây): cần thư mục `../quangcaongocan` đã chạy `npm ci`, rồi chạy `node tools/build-clouds.mjs`.
- Kiểm tra `Code.gs` trên máy: `node apps-script/test.js`.
