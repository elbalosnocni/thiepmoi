/**
 * THIEP MOI - Google Apps Script backend
 * Tao sheet RSVP tu dong neu chua ton tai.
 */
const RSVP_CONFIG = {
  SHEET_NAME: 'RSVP',
  HEADERS: ['Thời gian gửi', 'Tên khách mời', 'Xác nhận', 'Số người', 'Lời chúc']
};

function doGet() {
  return jsonOutput_({ ok: true, message: 'RSVP API is running' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const payload = parsePayload_(e);
    const name = cleanText_(payload.name, 120);
    const status = cleanText_(payload.status, 40);
    const wish = cleanText_(payload.wish, 500);
    const count = Number(payload.count);

    if (!name) throw new Error('Vui lòng nhập họ tên.');
    if (!['Sẽ tham dự', 'Không thể tham dự'].includes(status)) throw new Error('Trạng thái xác nhận không hợp lệ.');
    if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error('Số người tham dự phải từ 1 đến 10.');

    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('Không tìm thấy Google Spreadsheet được liên kết với Apps Script.');
    let sheet = ss.getSheetByName(RSVP_CONFIG.SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(RSVP_CONFIG.SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, RSVP_CONFIG.HEADERS.length).setValues([RSVP_CONFIG.HEADERS]);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), name, status, count, wish]);
    return jsonOutput_({ ok: true, message: 'Đã lưu xác nhận tham dự.' });
  } catch (err) {
    return jsonOutput_({ ok: false, message: err.message || 'Không thể lưu xác nhận.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('Dữ liệu gửi lên bị trống.');
  const raw = e.postData.contents;
  const type = String(e.postData.type || '').toLowerCase();
  if (type.indexOf('application/json') >= 0) return JSON.parse(raw);
  // Hỗ trợ application/x-www-form-urlencoded hoặc text/plain chứa JSON.
  if (raw.trim().charAt(0) === '{') return JSON.parse(raw);
  const result = {};
  raw.split('&').forEach(function (pair) {
    const parts = pair.split('=');
    if (parts.length) result[decodeURIComponent(parts[0].replace(/\+/g, ' '))] = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
  });
  return result;
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
