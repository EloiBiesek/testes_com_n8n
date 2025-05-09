#!/usr/bin/env node
/**
 * Script para sincronizar workflows entre a pasta cursorN8Nworkflows e o n8n Cloud.
 * Uso:
 *   - node sync_n8n_folder.ts      # Pull (baixa do n8n para local)
 *   - node sync_n8n_folder.ts push # Push (envia do local para n8n)
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import fetch from 'node-fetch';
// Import from the .cjs file
const { logAction } = require('./action-logger.cjs');

// Carrega variáveis de ambiente
config({ path: path.resolve(process.cwd(), 'env/.env') });

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_URL || !N8N_API_KEY) {
  console.error('❌ Erro: N8N_API_URL e N8N_API_KEY devem ser definidos no arquivo env/.env');
  process.exit(1);
}

const WORKFLOWS_FOLDER = path.resolve(process.cwd(), 'flows/cursorN8Nworkflows');

// Garante que a pasta de workflows existe
if (!fs.existsSync(WORKFLOWS_FOLDER)) {
  fs.mkdirSync(WORKFLOWS_FOLDER, { recursive: true });
  console.log(`📁 Pasta ${WORKFLOWS_FOLDER} criada`);
}

// Define os headers para as requisições HTTP
const headers = {
  'Content-Type': 'application/json',
  'X-N8N-API-KEY': N8N_API_KEY
};

/**
 * Obtém todos os workflows do n8n Cloud
 */
async function getWorkflowsFromN8n() {
  try {
    const response = await fetch(`${N8N_API_URL}/workflows`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar workflows do n8n:', error);
    process.exit(1);
  }
}

/**
 * Salva um workflow como arquivo JSON local
 */
function saveWorkflowToFile(workflow) {
  const filename = `${WORKFLOWS_FOLDER}/${workflow.name.replace(/[^a-zA-Z0-9_]/g, '_')}.json`;
  fs.writeFileSync(filename, JSON.stringify(workflow, null, 2));
  console.log(`💾 Salvo: ${filename}`);
}

/**
 * Envia um workflow para o n8n Cloud
 */
async function pushWorkflowToN8n(workflowData, existingWorkflows) {
  try {
    // Verifica se o workflow já existe pelo nome
    const existingWorkflow = existingWorkflows.find(w => w.name === workflowData.name);

    let response;
    if (existingWorkflow) {
      // Atualiza workflow existente
      response = await fetch(`${N8N_API_URL}/workflows/${existingWorkflow.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(workflowData)
      });
      console.log(`🔄 Atualizando workflow: ${workflowData.name}`);
    } else {
      // Cria novo workflow
      response = await fetch(`${N8N_API_URL}/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify(workflowData)
      });
      console.log(`➕ Criando workflow: ${workflowData.name}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`❌ Erro ao enviar workflow ${workflowData.name}:`, error);
    return null;
  }
}

/**
 * Sincroniza do n8n para a pasta local (pull)
 */
async function pullFromN8n() {
  console.log('🔄 Sincronizando workflows do n8n para a pasta local...');
  
  const workflows = await getWorkflowsFromN8n();
  console.log(`🔍 Encontrados ${workflows.length} workflows no n8n`);
  
  // Limpa a pasta antes
  fs.readdirSync(WORKFLOWS_FOLDER).forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(WORKFLOWS_FOLDER, file));
    }
  });
  
  workflows.forEach(workflow => {
    saveWorkflowToFile(workflow);
  });
  
  console.log('✅ Sincronização concluída!');
  
  // Log action
  logAction('sync_pull', {
    timestamp: new Date().toISOString(),
    count: workflows.length,
    workflowNames: workflows.map(w => w.name)
  });
}

/**
 * Sincroniza da pasta local para o n8n (push)
 */
async function pushToN8n() {
  console.log('🔄 Sincronizando workflows da pasta local para o n8n...');
  
  // Obtém os workflows existentes no n8n para comparação
  const existingWorkflows = await getWorkflowsFromN8n();
  console.log(`🔍 Encontrados ${existingWorkflows.length} workflows existentes no n8n`);
  
  const files = fs.readdirSync(WORKFLOWS_FOLDER).filter(file => file.endsWith('.json'));
  console.log(`🔍 Encontrados ${files.length} arquivos JSON na pasta local`);
  
  let successCount = 0;
  const results = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(WORKFLOWS_FOLDER, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const workflowData = JSON.parse(fileContent);
      
      const result = await pushWorkflowToN8n(workflowData, existingWorkflows);
      if (result) {
        successCount++;
        results.push({
          name: workflowData.name,
          status: 'success',
          id: result.id
        });
      } else {
        results.push({
          name: workflowData.name,
          status: 'failure'
        });
      }
    } catch (error) {
      console.error(`❌ Erro ao processar arquivo ${file}:`, error);
      results.push({
        name: file,
        status: 'failure',
        error: error.message
      });
    }
  }
  
  console.log(`✅ Sincronização concluída! ${successCount}/${files.length} workflows enviados com sucesso.`);
  
  // Log action
  logAction('sync_push', {
    timestamp: new Date().toISOString(),
    totalCount: files.length,
    successCount,
    failureCount: files.length - successCount,
    results
  }, successCount === files.length ? 'success' : 'warning');
}

// Executa a função apropriada com base nos argumentos
const isPush = process.argv.includes('push');
if (isPush) {
  pushToN8n();
} else {
  pullFromN8n();
} 