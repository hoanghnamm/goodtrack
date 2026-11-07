// goodtrack – nhận đăng ký dùng thử sớm, ghi vào Google Sheet.
// Dán toàn bộ file này vào Extensions → Apps Script của Google Sheet (xem README).

const SHEET_NAME = 'Đăng ký';
// Phải giống SOCIAL_RE trong main.js
const SOCIAL_RE = /^(@[A-Za-z0-9._]{1,30}|(https?:\/\/)?((www|m|web|vm|vt)\.)?(instagram\.com|facebook\.com|fb\.com|tiktok\.com)\/\S+)$/i;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: người thật không thấy ô này. Có dữ liệu = bot, trả "ok" nhưng không ghi.
  if (p.website) return json({ ok: true });

  const shop = String(p.shop || '').trim();
  const social = String(p.social || '').trim();
  const ua = String(p.ua || '').slice(0, 400);

  if (!shop || shop.length > 100) return json({ ok: false, error: 'shop' });
  if (social.length > 200 || !SOCIAL_RE.test(social)) return json({ ok: false, error: 'social' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(['Thời gian', 'Tên shop', 'Link MXH', 'User agent']);
    sheet.appendRow([new Date(), safe(shop), safe(social), safe(ua)]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

// Mở URL Web App trên trình duyệt để kiểm tra đã deploy đúng chưa.
function doGet() {
  return json({ ok: true, message: 'goodtrack waitlist đang chạy' });
}

// Chặn chèn công thức vào Sheet (ô bắt đầu bằng = + - @ sẽ được lưu dạng chữ).
function safe(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
