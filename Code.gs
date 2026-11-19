function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Lấy thời gian hiện tại theo giờ Việt Nam
  var timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
  
  // Ghi một dòng mới vào Google Sheets
  sheet.appendRow([
    timestamp,
    data.name,
    data.status,
    data.count,
    data.wish
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
