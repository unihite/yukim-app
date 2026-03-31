const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\134826a1-914b-44c4-aa70-9896129201ed\\.system_generated\\logs\\overview.txt';
const outputPath = 'C:\\Users\\USER\\.antigravity\\yukim-app\\src\\constants\\advices.ts';

const logContent = fs.readFileSync(logPath, 'utf8');

// Find the block of text containing the user's advice list
const startMarker = '소담 조언 64과체';
let startIndex = logContent.lastIndexOf(startMarker);

const searchBlock = logContent.slice(startIndex);

// Regex to capture each advice block
// Examples:
// 1.원수과 ... ⑱혼인 : 조건을 맞추면 성사된다.
// 4수. 천망과 ... ⑱ 혼인 : 성사되기 어렵다.
// 64.사기과 ... ⑱ 혼인 : 성사되기 어렵다.

const blocks = searchBlock.split(/(?=\n\d+(?:수)?\.\s*[가-힣]+과)/g).filter(b => /^\n\d/.test(b));

const advices = {};

blocks.forEach((block) => {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
  const match = lines[0].match(/^(\d+)(?:수)?\.\s*([가-힣]+과)/);
  if (!match) return;

  const num = parseInt(match[1]);
  const title = match[2];

  let descriptions = [];
  let itemsMatch = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Check if it's an item line, like ⓵모망사 : 순조롭다. or ⓵ 모망사 : ...
    // Using a simpler regex that looks for Korean text followed by colon
    const itemMatch = line.match(/^[^가-힣a-zA-Z]*([가-힣]+)\s*:\s*(.*)/);
    if (itemMatch) {
      itemsMatch.push({ key: itemMatch[1], val: itemMatch[2] });
    } else {
      descriptions.push(line);
    }
  }

  advices[num] = {
    title: title,
    content: descriptions.join(' '),
    items: itemsMatch.reduce((acc, curr) => {
      acc[curr.key] = curr.val;
      return acc;
    }, {})
  };
});

let tsContent = `/**
 * @file advices.ts
 * @description 프리미엄 소담 조언(Advice) 세밀 파싱 데이터
 */

export interface AdviceData {
  title: string;
  content: string;
  items?: Record<string, string>;
}

export const ADVICES: Record<number, AdviceData> = ${JSON.stringify(advices, null, 2)};
`;

fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log('Saved ' + Object.keys(advices).length + ' advices to ' + outputPath);
