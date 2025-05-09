#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Lê tudo que o Agent enviar pelo stdin
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const output = Buffer.concat(chunks).toString('utf8');

// Cria pasta de logs, se não existir
const logDir = path.resolve('cursor_logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Nome do arquivo: 2025-05-09_15-42-12.md
const ts = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const file = path.join(logDir, `${ts}.md`);

// Escreve log
const header = `# Cursor Agent log – ${new Date().toISOString()}\n\n`;
fs.writeFileSync(file, header + output, 'utf8');

console.log(`📝  Log automático salvo em ${path.relative('.', file)}`); 