#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs', 'handoff');
const finalReportFile = path.join(docsDir, 'FINAL_DEPLOY_REPORT.md');

// 標準入力から受け取った内容を保存
let input = '';
process.stdin.on('data', chunk => {
  input += chunk;
});
process.stdin.on('end', () => {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(finalReportFile, input, 'utf8');
  console.log(`✅ FINAL_DEPLOY_REPORT.md に保存しました`);
});
