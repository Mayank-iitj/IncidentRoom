const fs = require('fs');
const path = require('path');

// Patch CometChat Chat SDK window/SSR global
const chatTarget = path.join(__dirname, 'node_modules', '@cometchat', 'chat-sdk-javascript', 'CometChat.js');
if (fs.existsSync(chatTarget)) {
  let code = fs.readFileSync(chatTarget, 'utf8');
  const targetStr = '}(window,function(){';
  const replaceStr = '}(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this),function(){';
  if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(chatTarget, code, 'utf8');
    console.log('Successfully patched CometChat.js');
  } else if (code.includes(replaceStr)) {
    console.log('CometChat.js already patched.');
  }
}
