// =====================================================
// CODE.GS - Google Apps Script Backend cho CLB Doanh nhân Quảng Trị
// Spreadsheet: https://docs.google.com/spreadsheets/d/1fYi50TPcwPPbXM_Vlefya3oc5vWxEIoYxIagkY1frr4
// Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone
// Sau khi deploy, lấy URL dán vào m.html tại biến GAS_URL
// =====================================================

const SHEET_ID = '1fYi50TPcwPPbXM_Vlefya3oc5vWxEIoYxIagkY1frr4';

// =====================================================
// MAIN HANDLERS
// =====================================================

function doGet(e) {
  const action   = e.parameter.action;
  const callback = e.parameter.callback; // JSONP support
  let result;

  try {
    if (action === 'list') {
      result = getListResponse();
    } else if (action === 'detail' || action === 'getMember') {
      const id = e.parameter.id || e.parameter.c;
      result = getDetailResponse(id);
    } else {
      result = { status: 'error', message: 'Invalid action' };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  const json = JSON.stringify(result);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return createJsonResponse({ success: false, message: 'Hệ thống đang bận, vui lòng thử lại.' });
  }
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'chat')       return createJsonResponse(handleChat(data));
    if (action === 'submitForm') return createJsonResponse(handleForm(data));
    return createJsonResponse({ error: 'Invalid action' });
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// DATA FUNCTIONS
// =====================================================

// Các key nhạy cảm — chỉ dùng nội bộ backend, KHÔNG trả về frontend
const PRIVATE_CONFIG_KEYS = ['LLM_Model', 'LLM_API_Key', 'LLM_Max_Token', 'LLM_Guide'];

function getConfigData(configSheet) {
  if (!configSheet) {
    configSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Configs');
  }
  const data   = configSheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) config[data[i][0]] = data[i][1];
  }
  return config;
}

// Trả về configs đã lọc bỏ thông tin nhạy cảm — dùng cho response gửi về frontend
function getSafeConfigs(config) {
  const safe = {};
  for (const key in config) {
    if (!PRIVATE_CONFIG_KEYS.includes(key)) safe[key] = config[key];
  }
  return safe;
}

// Trả về danh sách thành viên (chỉ các trường cần cho listing view) + configs
function getListResponse() {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName('Members');
  const configs = getConfigData(ss.getSheetByName('Configs'));
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const allMembers = [];

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const member = {};
    for (let j = 0; j < headers.length; j++) {
      member[headers[j]] = row[j] !== undefined ? row[j] : '';
    }
    const visible = member['Visibility'];
    if (visible === true || visible === 'TRUE' || visible === 'true') {
      allMembers.push({
        Member_ID:            member['Member_ID'],
        Member_Title:         member['Member_Title'],
        Member_Name:          member['Member_Name'],
        Member_Avatar_Small:  member['Member_Avatar_Small'],
        Member_Position:      member['Member_Position'],
        Member_Company:       member['Member_Company'],
        Member_Company_Short: member['Member_Company_Short']
      });
    }
  }

  const total = allMembers.length;
  return {
    status: 'success',
    configs: getSafeConfigs(configs),
    data: {
      members:       allMembers,
      total_members: total,
      total_pages:   1,
      current_page:  1
    }
  };
}

// Trả về đầy đủ thông tin 1 thành viên + cấu hình chung
function getDetailResponse(memberId) {
  if (!memberId) return { status: 'error', message: 'Thiếu Member ID' };
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const configs = getConfigData(ss.getSheetByName('Configs'));
  const member  = getMemberById(ss.getSheetByName('Members'), memberId);
  if (!member) return { status: 'error', message: 'Không tìm thấy thành viên: ' + memberId };
  return { status: 'success', member: member, configs: getSafeConfigs(configs) };
}

function getMemberById(sheet, memberId) {
  if (!sheet) sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Members');
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const member = {};
    for (let j = 0; j < headers.length; j++) {
      member[headers[j]] = row[j] !== undefined ? row[j] : '';
    }
    if (String(member['Member_ID']).trim() === String(memberId).trim()) {
      return member;
    }
  }
  return null;
}

// =====================================================
// CHAT HANDLER
// =====================================================

function handleChat(data) {
  const source    = data.source;
  const sessionId = data.sessionId || data.session_id || '';
  const messages  = data.messages;

  if (!source || !sessionId || !messages || messages.length === 0) {
    return { success: false, message: 'Thiếu thông tin chat.' };
  }

  const ss     = SpreadsheetApp.openById(SHEET_ID);
  const config = getConfigData(ss.getSheetByName('Configs'));

  // Kiểm tra chatbot có bật không
  const chatbotOn = config['Chatbot_Validity'];
  if (chatbotOn !== true && String(chatbotOn).toUpperCase() !== 'TRUE') {
    return { success: false, message: 'Chatbot đang tạm ngưng phục vụ.' };
  }

  // Lấy thông tin thành viên để xây dựng context
  const member = getMemberById(ss.getSheetByName('Members'), source);
  if (!member) return { success: false, message: 'Không tìm thấy thành viên.' };

  // Xây dựng system prompt
  const systemPrompt = buildChatSystemPrompt(config, member);

  // Lấy tin nhắn mới nhất của user
  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== 'user') return { success: false, message: 'Tin nhắn không hợp lệ.' };

  // Gọi LLM
  let botResponse;
  try {
    botResponse = callLLM(config, systemPrompt, messages);
  } catch (err) {
    botResponse = 'Xin lỗi, em đang gặp sự cố kỹ thuật. Anh/chị vui lòng thử lại sau nhé.';
    console.error('LLM Error:', err.toString());
  }

  // Lưu lịch sử chat vào sheet Chat-Data
  try {
    saveChatHistory(ss.getSheetByName('Chat-Data'), source, sessionId, lastMsg.content, botResponse);
  } catch (err) {
    console.error('Save chat error:', err.toString());
  }

  return { response: botResponse };
}

function buildChatSystemPrompt(config, member) {
  const assistantName = member['Assistant_Name'] || 'Trợ lý';
  const memberName    = member['Member_Name']    || '';
  const memberTitle   = member['Member_Title']   || 'Mr.';
  const position      = member['Member_Position'] || '';
  const company       = member['Member_Company']  || '';
  const guide         = config['LLM_Guide'] || 'Chuyên nghiệp, ngắn gọn, hữu ích.';
  const maxToken      = parseInt(config['LLM_Max_Token']) || 200;

  // Tổng hợp lĩnh vực kinh doanh
  const businesses = [];
  for (let i = 1; i <= 10; i++) {
    const val = member['Business' + i];
    if (val) businesses.push('• ' + val);
  }

  // Tổng hợp sản phẩm
  const products = [];
  for (let i = 1; i <= 10; i++) {
    const idx  = String(i).padStart(2, '0');
    const name = member['Product_' + idx + '_Name'];
    const desc = member['Product_' + idx + '_Description'];
    if (name) {
      const shortDesc = desc ? ': ' + String(desc).substring(0, 150) + '...' : '';
      products.push(i + '. ' + name + shortDesc);
    }
  }

  return `BẠN LÀ: ${assistantName}, trợ lý ảo thân thiết của ${memberTitle} ${memberName} — ${position}, ${company}.

PHONG CÁCH GIAO TIẾP: ${guide}

THÔNG TIN VỀ ${memberName.toUpperCase()}:
${member['Businessmen_Profile'] || member['Slogan'] || 'Không có thông tin chi tiết.'}

LĨNH VỰC KINH DOANH:
${businesses.join('\n') || 'Không có thông tin.'}

SẢN PHẨM & DỊCH VỤ:
${products.join('\n') || 'Không có thông tin.'}

GIỚI THIỆU CÔNG TY:
${member['Business_Profile'] || 'Không có thông tin.'}

THÔNG TIN LIÊN HỆ:
- SĐT: ${member['Mobile'] || 'N/A'}
- Website: ${member['Website'] || 'N/A'}
- Địa chỉ: ${member['Company_Addr1'] || 'N/A'}

QUY TẮC TRẢ LỜI:
- Trả lời ngắn gọn, tối đa ${maxToken} tokens.
- Chỉ trả lời về thông tin liên quan đến doanh nhân và doanh nghiệp thành viên CLB Doanh nhân Quảng Trị.
- Không trả lời ngoài lĩnh vực kinh doanh.
- Nếu không biết, khéo léo đề nghị khách để lại thông tin để ${memberTitle} ${memberName} liên hệ lại.
- Dùng Markdown (** ** để in đậm, gạch đầu dòng) để trình bày rõ ràng.`;
}

function callLLM(config, systemPrompt, messages) {
  const model    = config['LLM_Model'];
  const apiKey   = config['LLM_API_Key'];
  const maxToken = parseInt(config['LLM_Max_Token']) || 200;

  if (!apiKey) throw new Error('Chưa cấu hình API Key trong sheet Configs.');
  if (model === 'Gemini')   return callGeminiAPI(apiKey, systemPrompt, messages, maxToken);
  if (model === 'DeepSeek') return callDeepSeekAPI(apiKey, systemPrompt, messages, maxToken);
  if (model === 'Grok')     return callGrokAPI(apiKey, systemPrompt, messages, maxToken);
  throw new Error('Model ' + model + ' chưa được hỗ trợ. Dùng Grok / DeepSeek / Gemini.');
}

function callGeminiAPI(key, system, history, maxToken) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key;
  const historyText = history.map(function(m) {
    return (m.role === 'user' ? 'Khách' : 'Trợ lý') + ': ' + m.content;
  }).join('\n');
  const fullPrompt = system + '\n\n=== LỊCH SỬ TRÒ CHUYỆN ===\n' + historyText + '\n\nTrợ lý:';
  const payload = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: maxToken }
  };
  const options = {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(resp.getContentText());
  if (json.candidates && json.candidates[0] && json.candidates[0].content) {
    return json.candidates[0].content.parts[0].text;
  }
  return 'Em chưa hiểu ý anh/chị lắm, anh/chị nói lại giúp em nhé.';
}

function callDeepSeekAPI(key, system, history, maxToken) {
  const url      = 'https://api.deepseek.com/chat/completions';
  const messages = [{ role: 'system', content: system }].concat(history);
  const payload  = { model: 'deepseek-chat', messages: messages, temperature: 0.7, max_tokens: maxToken };
  const options  = {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(resp.getContentText());
  if (json.choices && json.choices.length > 0) return json.choices[0].message.content;
  return 'Kết nối DeepSeek bị gián đoạn.';
}

function callGrokAPI(key, system, history, maxToken) {
  const url      = 'https://api.x.ai/v1/chat/completions';
  const messages = [{ role: 'system', content: system }].concat(history);
  const payload  = { model: 'grok-4-latest', messages: messages, temperature: 0.7, max_tokens: maxToken };
  const options  = {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(resp.getContentText());
  if (json.choices && json.choices.length > 0) return json.choices[0].message.content;
  return 'Kết nối Grok bị gián đoạn.';
}

// Lưu lịch sử chat vào sheet Chat-Data (cấu trúc ngang: mỗi row = 1 session)
function saveChatHistory(sheet, source, sessionId, userMsg, botMsg) {
  if (!sheet) sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Chat-Data');
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(source).trim() &&
        String(data[i][1]).trim() === String(sessionId).trim()) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  if (rowIndex === -1) {
    // Session mới: tạo row với [Source, Session_ID, userMsg, botMsg]
    sheet.appendRow([source, sessionId, userMsg, botMsg]);
  } else {
    // Session tồn tại: tìm cột cuối cùng có dữ liệu, append vào cột kế tiếp
    const lastCol  = sheet.getLastColumn();
    const rowData  = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
    let lastFilled = 1;
    for (let j = 0; j < rowData.length; j++) {
      if (rowData[j] !== '' && rowData[j] !== null && rowData[j] !== undefined) {
        lastFilled = j + 1; // 1-based
      }
    }
    sheet.getRange(rowIndex, lastFilled + 1).setValue(userMsg);
    sheet.getRange(rowIndex, lastFilled + 2).setValue(botMsg);
  }
}

// =====================================================
// FORM HANDLER
// =====================================================

function handleForm(data) {
  const source    = data.source;
  const sessionId = data.sessionId || data.session_id || '';
  const name      = data.name;
  const purpose   = data.purpose;
  const mobile    = data.mobile;
  const email     = data.email;
  const title     = data.title;
  const message   = data.message;

  if (!source || !name) {
    return { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' };
  }
  try {
    const ss        = SpreadsheetApp.openById(SHEET_ID);
    const formSheet = ss.getSheetByName('Form-Data');
    formSheet.appendRow([
      source,
      sessionId || '',
      new Date(),
      name       || '',
      purpose    || '',
      mobile     || '',
      email      || '',
      title      || '',
      message    || ''
    ]);
    return { status: 'success', message: 'Đã gửi thông tin thành công! Chúng tôi sẽ liên hệ sớm.' };
  } catch (err) {
    return { success: false, message: 'Lỗi lưu dữ liệu: ' + err.toString() };
  }
}

// =====================================================
// HÀM TEST (chạy thủ công từ Apps Script editor)
// =====================================================

function testGetList() {
  const result = getListResponse();
  console.log('Total members:', result.data.total_members);
  console.log('First member:', JSON.stringify(result.data.members[0]));
}

function testGetMember() {
  const result = getDetailResponse('A001');
  console.log('Member:', JSON.stringify(result.member).substring(0, 500));
  console.log('Config keys:', Object.keys(result.configs || {}));
}

function testSaveChat() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Chat-Data');
  saveChatHistory(sheet, 'A001', 'lacs_test_001', 'Test câu hỏi', 'Test câu trả lời');
  console.log('Chat saved OK');
}

function testSaveForm() {
  const result = handleForm({
    source:    'A001',
    sessionId: 'lacs_test_001',
    name:      'Test User',
    purpose:   'Test',
    mobile:    '0900000000',
    email:     'test@test.com',
    title:     'Test title',
    message:   'Test message'
  });
  console.log('Form result:', JSON.stringify(result));
}
