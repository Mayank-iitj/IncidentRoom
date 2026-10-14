const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'node_modules', '@cometchat', 'chat-sdk-javascript', 'CometChat.js');
if (fs.existsSync(target)) {
  let code = fs.readFileSync(target, 'utf8');
  const targetStr = '}(window,function(){';
  const replaceStr = '}(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this),function(){';
  if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(target, code, 'utf8');
    console.log('Successfully patched CometChat.js');
  } else if (code.includes(replaceStr)) {
    console.log('Already patched.');
  } else {
    console.log('Pattern not found.');
  }
} else {
  console.log('Target file does not exist.');
}
