#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// captura STDIN (output completo do Agent)
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const output = Buffer.concat(chunks).toString('utf8');

const logDir = path.resolve('cursor_logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const ts = new Date().toISOString().replace(/:/g, '-').replace(/\..*/, '');
const file = path.join(logDir, `${ts}.md`);
fs.writeFileSync(file, `# Cursor Agent log – ${new Date().toISOString()}\n\n${output}`);
console.log(`📝  Log automático salvo em ${path.relative('.', file)}`); 