#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Função principal que captura e salva o log
async function captureAndSaveAgentLog() {
  try {
    // Captura STDIN (output completo do Agent)
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const output = Buffer.concat(chunks).toString('utf8');

    // Cria diretório de logs se não existir
    const logDir = path.resolve('cursor_logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    // Cria nome do arquivo com timestamp
    const ts = new Date().toISOString().replace(/:/g, '-').replace(/\..*/, '');
    const file = path.join(logDir, `${ts}.md`);

    // Escreve o conteúdo no arquivo
    fs.writeFileSync(
      file, 
      `# Cursor Agent Log - ${new Date().toISOString()}\n\n${output}`,
      'utf8'
    );

    console.log(`📝 Log automático salvo em ${path.relative('.', file)}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar log: ${error.message}`);
  }
}

// Executa a função principal
captureAndSaveAgentLog();