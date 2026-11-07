// Kiểm tra nhanh Code.gs bằng Node (giả lập Google Sheet): node apps-script/test.js
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const rows = [];
const sheet = { getLastRow: () => rows.length, appendRow: (r) => rows.push(r) };
const ctx = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) },
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), ctx);
const post = (p) => JSON.parse(ctx.doPost({ parameter: p }).s);

assert.deepEqual(post({ shop: 'Nhà Sóc', social: '@nhasoc.order', ua: 'UA' }), { ok: true });
assert.deepEqual(rows[0], ['Thời gian', 'Tên shop', 'Link MXH', 'User agent']);
assert.equal(rows[1][1], 'Nhà Sóc');
assert.equal(rows[1][2], "'@nhasoc.order"); // chống chèn công thức
for (const s of ['https://www.instagram.com/abc', 'facebook.com/profile.php?id=1', 'https://vt.tiktok.com/ZS123/', 'm.facebook.com/shop'])
  assert.deepEqual(post({ shop: 'A', social: s }), { ok: true }, s);
for (const s of ['', 'abc', 'https://evil.com/instagram.com/x', '@', 'instagram.com/'])
  assert.deepEqual(post({ shop: 'A', social: s }), { ok: false, error: 'social' }, s);
assert.deepEqual(post({ shop: ' ', social: '@a' }), { ok: false, error: 'shop' });
assert.equal(post({ shop: '=HYPERLINK("x")', social: '@a' }).ok, true);
assert.equal(rows.at(-1)[1], '\'=HYPERLINK("x")');

const before = rows.length;
assert.deepEqual(post({ shop: 'Bot', social: '@bot', website: 'spam' }), { ok: true });
assert.equal(rows.length, before, 'honeypot không được ghi');

console.log('Code.gs OK');
