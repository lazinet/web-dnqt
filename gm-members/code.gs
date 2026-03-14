const SS_ID = '1fYi50TPcwPPbXM_Vlefya3oc5vWxEIoYxIagkY1frr4';

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getData') return createResponse(getAllData());
  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return createResponse({ success: false, message: "Hệ thống đang bận, vui lòng thử lại." });

  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'submitForm') return handleFormSubmission(data);
    if (data.action === 'chat') return handleChat(data);
    return createResponse({ error: 'Invalid action' });
  } catch (err) {
    return createResponse({ error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getAllData() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const configData = ss.getSheetByName('Configs').getDataRange().getValues();
  const config = {};
  for (let i = 1; i < configData.length; i++) {
    if (configData[i][0]) config[configData[i][0].split('=')[0]] = configData[i][1];
  }
  
  const membersData = ss.getSheetByName('Members').getDataRange().getValues();
  const headers = membersData[0];
  const members = [];
  for (let i = 1; i < membersData.length; i++) {
    const member = {};
    for (let j = 0; j < headers.length; j++) member[headers[j]] = membersData[i][j];
    if (member['Visibility'] === true || member['Visibility'] === 'TRUE') members.push(member);
  }
  return { config, members };
}

function handleFormSubmission(payload) {
  SpreadsheetApp.openById(SS_ID).getSheetByName('Form-Data').appendRow([
    payload.source, payload.sessionId, new Date(), payload.name, payload.purpose, payload.mobile, payload.email, payload.title, payload.message
  ]);
  return createResponse({ success: true, message: "Gửi thông tin thành công!" });
}

function handleChat(payload) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const configData = ss.getSheetByName('Configs').getDataRange().getValues();
  const config = {};
  for (let i = 1; i < configData.length; i++) if (configData[i][0]) config[configData[i][0].split('=')[0]] = configData[i][1];

  if (config['Chatbot_Validity'] !== true && config['Chatbot_Validity'] !== 'TRUE') {
    return createResponse({ response: "Hệ thống Chatbot đang tạm ngưng phục vụ." });
  }

  const chatSheet = ss.getSheetByName('Chat-Data');
  const chatData = chatSheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < chatData.length; i++) {
    if (chatData[i][0] === payload.source && chatData[i][1] === payload.sessionId) { rowIndex = i + 1; break; }
  }
  
  if (rowIndex === -1) {
    chatSheet.appendRow([payload.source, payload.sessionId, payload.message]);
    rowIndex = chatSheet.getLastRow();
  } else {
    chatSheet.getRange(rowIndex, chatSheet.getLastColumn() + 1).setValue(payload.message);
  }

  const responseText = processLLMRequest(config, payload.member, payload.messages);
  chatSheet.getRange(rowIndex, chatSheet.getLastColumn() + 1).setValue(responseText);
  return createResponse({ response: responseText });
}

function processLLMRequest(config, member, history) {
  const system = \`BẠN LÀ: \${member.Assistant_Name || 'Trợ lý'}, trợ lý của \${member.Member_Company}.
HƯỚNG DẪN: \${config['LLM_Guide']}
THÔNG TIN DOANH NHÂN: \${member.Businessmen_About} \${member.Businessmen_Profile}
THÔNG TIN CÔNG TY: \${member.Business_Profile}\`;

  const model = config['LLM_Model'];
  const apiKey = config['LLM_API_Key'];
  const maxTokens = parseInt(config['LLM_Max_Token']) || 200;

  if (!apiKey) return "Lỗi: Chưa cấu hình API Key.";

  try {
    if (model === 'Gemini') return callGeminiAPI(apiKey, system, history, maxTokens);
    if (model === 'DeepSeek') return callDeepSeekAPI(apiKey, system, history, maxTokens);
    if (model === 'Grok') return callGrokAPI(apiKey, system, history, maxTokens);
    return \`Model \${model} chưa được hỗ trợ.\`;
  } catch (err) {
    return \`Lỗi kỹ thuật: \${err.message}\`;
  }
}

function callGeminiAPI(key, system, history, maxTokens) {
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${key}\`;
  const historyText = history.map(m => \`\${m.role === 'user' ? 'Khách' : 'Em'}: \${m.content}\`).join('\\n');
  const payload = { contents: [{ parts: [{ text: \`\${system}\\n\\n\${historyText}\\n\\nEm trả lời:\` }] }], generationConfig: { maxOutputTokens: maxTokens } };
  const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
  const json = JSON.parse(res.getContentText());
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi phản hồi.";
}

function callDeepSeekAPI(key, system, history, maxTokens) {
  const url = 'https://api.deepseek.com/chat/completions';
  const payload = { model: "deepseek-chat", messages: [{ role: "system", content: system }, ...history], max_tokens: maxTokens };
  const res = UrlFetchApp.fetch(url, { method: 'post', headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" }, payload: JSON.stringify(payload), muteHttpExceptions: true });
  return JSON.parse(res.getContentText()).choices?.[0]?.message?.content || "Lỗi phản hồi.";
}

function callGrokAPI(key, system, history, maxTokens) {
  const url = 'https://api.x.ai/v1/chat/completions';
  const payload = { model: "grok-4-latest", messages: [{ role: "system", content: system }, ...history], max_tokens: maxTokens };
  const res = UrlFetchApp.fetch(url, { method: 'post', headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" }, payload: JSON.stringify(payload), muteHttpExceptions: true });
  return JSON.parse(res.getContentText()).choices?.[0]?.message?.content || "Lỗi phản hồi.";
}
