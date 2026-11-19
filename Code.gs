/** THIEP MOI MANAGER V2 - Google Apps Script backend
 * Tao 2 sheet Events va RSVP bang setup(). Moi su kien la mot dong trong Events.
 */
const APP = {
  EVENTS: 'Events', RSVP: 'RSVP',
  EVENT_HEADERS: ['EventID','Type','Title','Host','Subtitle','EventDate','EndDate','Address','MapURL','Message','Theme','Active','CreatedAt'],
  RSVP_HEADERS: ['SubmittedAt','EventID','EventTitle','GuestName','Status','GuestCount','Wish','Source']
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Hay mo Apps Script tu mot Google Spreadsheet.');
  const events = ensureSheet_(ss, APP.EVENTS, APP.EVENT_HEADERS);
  ensureSheet_(ss, APP.RSVP, APP.RSVP_HEADERS);
  if (events.getLastRow() < 2) {
    events.appendRow(['TAN-GIA-20261220','housewarming','Mừng Tân Gia','Gia đình','Tân Gia','2026-12-20T11:00:00+07:00','2026-12-20T13:00:00+07:00','Số 123 Đường Hoa Hồng, Quận Phú Nhuận, TP.HCM','','Gia đình trân trọng kính mời Quý khách đến chung vui tiệc tân gia và tham quan tổ ấm mới.','classic',true,new Date()]);
  }
  return 'Da tao/khoi tao Events va RSVP; da them su kien tan gia mau neu bang Events dang trong.';
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = /^[a-zA-Z_$][\w.$]*$/.test(p.callback || '') ? p.callback : '';
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('Spreadsheet chua duoc lien ket.');
    const rows = readObjects_(ss.getSheetByName(APP.EVENTS));
    const active = rows.filter(x => String(x.Active).toLowerCase() !== 'false' && String(x.Active) !== '0');
    const event = p.event ? active.find(x => String(x.EventID) === String(p.event)) : active[0];
    const result = p.action === 'health' ? {ok:true, message:'Thiep Moi Manager API is running'} :
      (event ? {ok:true, event:publicEvent_(event)} : {ok:false, message:'Khong tim thay su kien hoat dong.'});
    const body = callback ? callback + '(' + JSON.stringify(result) + ');' : JSON.stringify(result);
    return ContentService.createTextOutput(body).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
  } catch (err) {
    const result = {ok:false, message:err.message || 'API error'};
    return ContentService.createTextOutput(callback ? callback+'('+JSON.stringify(result)+');' : JSON.stringify(result))
      .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
  }
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = parseForm_(e);
    const eventId = clean_(p.eventId, 80);
    const name = clean_(p.name, 120);
    const status = clean_(p.status, 40);
    const count = Number(p.count);
    const wish = clean_(p.wish, 500);
    if (!eventId || !name) throw new Error('Thieu ma su kien hoac ten khach.');
    if (!['Sẽ tham dự','Không thể tham dự'].includes(status)) throw new Error('Trang thai RSVP khong hop le.');
    if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error('So nguoi tham du phai tu 1 den 20.');
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const events = readObjects_(ss.getSheetByName(APP.EVENTS));
    const ev = events.find(x => String(x.EventID) === eventId && String(x.Active).toLowerCase() !== 'false');
    if (!ev) throw new Error('Su kien khong ton tai hoac da tat.');
    const sheet = ensureSheet_(ss, APP.RSVP, APP.RSVP_HEADERS);
    sheet.appendRow([new Date(), eventId, clean_(ev.Title,150), name, status, count, wish, clean_(p.source,100)]);
    return json_({ok:true, message:'Da ghi nhan xac nhan.'});
  } catch (err) { return json_({ok:false, message:err.message || 'Khong the luu RSVP.'}); }
  finally { try { lock.releaseLock(); } catch (_) {} }
}
function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (!sh.getLastRow()) { sh.getRange(1,1,1,headers.length).setValues([headers]); sh.setFrozenRows(1); }
  return sh;
}
function readObjects_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const heads = values.shift().map(String);
  return values.filter(r => r.some(v => v !== '')).map(r => heads.reduce((o,h,i) => (o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i], o), {}));
}
function publicEvent_(x) {
  return {id:String(x.EventID), type:String(x.Type || 'custom'), title:String(x.Title || 'Thư mời'), host:String(x.Host || ''),
    subtitle:String(x.Subtitle || ''), date:String(x.EventDate || ''), endDate:String(x.EndDate || ''), address:String(x.Address || ''),
    mapUrl:String(x.MapURL || ''), message:String(x.Message || ''), theme:String(x.Theme || 'classic')};
}
function parseForm_(e) {
  if (!e || !e.parameter) throw new Error('Du lieu gui len trong.');
  return e.parameter;
}
function clean_(v,n) { return String(v == null ? '' : v).replace(/[<>]/g,'').trim().slice(0,n); }
function json_(x) { return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON); }
