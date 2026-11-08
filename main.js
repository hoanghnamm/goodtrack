// ================= CẤU HÌNH =================
// Dán URL Web App của Google Apps Script vào giữa hai dấu nháy (xem README, bước 2).
// Ví dụ: 'https://script.google.com/macros/s/AKfy.../exec'
const WAITLIST_URL = 'https://script.google.com/macros/s/AKfycbyPFm-YHuPjIXFpvbFMCaTL6stDZ1BpcsXl99nUXhOPqdp7nMKh6X8AEhDQCXo5DVIHHg/exec';
// ============================================

// Phải giống SOCIAL_RE trong apps-script/Code.gs
const SOCIAL_RE = /^(@[A-Za-z0-9._]{1,30}|(https?:\/\/)?((www|m|web|vm|vt)\.)?(instagram\.com|facebook\.com|fb\.com|tiktok\.com)\/\S+)$/i;

const $ = (s) => document.getElementById(s);

/* ---------- Form đăng ký ---------- */
const wl = $('waitlist');
const btn = wl.querySelector('button');

function fieldError(name, text) {
  $(name + '-err').textContent = text;
  wl.elements[name].setAttribute('aria-invalid', text ? 'true' : 'false');
  return !text;
}

function showSuccess() {
  wl.hidden = true;
  $('wl-ok').hidden = false;
  $('wl-ok').focus();
}

wl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const shop = wl.elements.shop.value.trim();
  const social = wl.elements.social.value.trim();

  const okShop = fieldError('shop', shop ? '' : 'Anh/chị nhập tên shop giúp goodtrack nhé.');
  const okSocial = fieldError('social',
    !social ? 'Anh/chị nhập link trang bán hàng giúp goodtrack nhé.'
    : SOCIAL_RE.test(social) ? '' : 'Link chưa đúng. Ví dụ: instagram.com/tenshop hoặc @tenshop');
  if (!okShop || !okSocial) {
    wl.elements[okShop ? 'social' : 'shop'].focus();
    return;
  }
  if (wl.elements.website.value) return showSuccess(); // honeypot: bot điền vào, giả vờ thành công

  btn.disabled = true;
  btn.textContent = 'Đang gửi…';
  $('form-msg').textContent = '';
  try {
    if (!WAITLIST_URL) throw new Error('Chưa cấu hình WAITLIST_URL trong main.js');
    const res = await fetch(WAITLIST_URL, {
      method: 'POST',
      // URLSearchParams => application/x-www-form-urlencoded, không bị CORS preflight
      body: new URLSearchParams({ shop, social, ua: navigator.userAgent, website: '' }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Lỗi máy chủ');
    showSuccess();
  } catch (err) {
    console.warn('Đăng ký lỗi:', err.message);
    $('form-msg').textContent = 'Chưa gửi được, anh/chị kiểm tra mạng và bấm gửi lại giúp goodtrack nhé.';
    btn.disabled = false;
    btn.textContent = 'Gửi lại';
  }
});
