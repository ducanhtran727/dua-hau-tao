// Replace the spreadsheet ID and deploy this as a Web App.
const spreadsheetId = "";
const orderSheetName = "Đơn hàng";
const packages = {
  "5": "5 gói · 99.000đ",
  "8": "8 gói · 149.000đ",
  "15": "15 gói · 219.000đ",
  "20": "20 gói · 259.000đ",
  "100g": "1 lạng · 399.000đ",
};

function doPost(event) {
  const data = event.parameter;
  const name = (data.full_name || "").trim();
  const phone = (data.phone_number || "").trim();
  const address = (data.address || "").trim();
  const packageId = data.package;
  if (!name || !address || !/^(?:\+84|84|0)[35789][0-9]{8}$/.test(phone) ||
      !Object.prototype.hasOwnProperty.call(packages, packageId)) {
    return orderResponse(false);
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return orderResponse(false);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(orderSheetName) || spreadsheet.insertSheet(orderSheetName);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Họ tên", "Số điện thoại", "Địa chỉ", "Gói mua"]);
    }
    const row = sheet.getRange(sheet.getLastRow() + 1, 1, 1, 4);
    row.setNumberFormat("@");
    row.setValues([[name, phone, address, packages[packageId]].map(asSheetText)]);
    SpreadsheetApp.flush();
    return orderResponse(true);
  } catch (error) {
    console.error(error.message);
    return orderResponse(false);
  } finally {
    lock.releaseLock();
  }
}

function asSheetText(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function orderResponse(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
