#!/usr/bin/env node
/**
 * Script para fazer deploy de um ou múltiplos workflows no n8n Cloud.
 * Este é o método "legacy" para publicação individual de workflows.
 * 
 * Uso:
 *   - node deploy_to_n8n.ts <arquivo.json>
 *   - node deploy_to_n8n.ts <diretório>
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

// Define os headers para as requisições HTTP
const headers = {
  'Content-Type': 'application/json',
  'X-N8N-API-KEY': N8N_API_KEY
};

/**
 * Obtém todos os workflows do n8n Cloud para verificação
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
 * Envia um workflow para o n8n Cloud
 */
async function deployWorkflow(filePath, existingWorkflows) {
  try {
    console.log(`📦 Processando: ${filePath}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const workflowData = JSON.parse(fileContent);
    
    // Verifica se o workflow já existe pelo nome
    const existingWorkflow = existingWorkflows.find(w => w.name === workflowData.name);

    let response;
    let actionType = 'update';
    
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
      actionType = 'create';
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`✅ Sucesso: ${workflowData.name}`);
    
    // Log successful deployment
    logAction('deploy_workflow', {
      name: workflowData.name,
      id: result.id,
      action: actionType,
      file: path.basename(filePath)
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao implantar ${filePath}:`, error);
    
    // Log failed deployment
    logAction('deploy_workflow', {
      file: path.basename(filePath),
      error: error.message
    }, 'failure');
    
    return false;
  }
}

/**
 * Processa um diretório, implantando todos os arquivos JSON nele
 */
async function processDirectory(dirPath, existingWorkflows) {
  console.log(`🔍 Processando diretório: ${dirPath}`);
  
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
  console.log(`📋 Encontrados ${files.length} arquivos JSON`);
  
  let successCount = 0;
  let failureCount = 0;
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const success = await deployWorkflow(filePath, existingWorkflows);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    results.push({
      file,
      success
    });
  }
  
  console.log(`📊 Resultado: ${successCount}/${files.length} workflows implantados com sucesso`);
  
  // Log bulk deployment results
  logAction('deploy_directory', {
    directory: path.basename(dirPath),
    totalCount: files.length,
    successCount,
    failureCount,
    results
  }, failureCount === 0 ? 'success' : 'warning');
}

// Função principal
async function main() {
  const startTime = new Date();
  
  // Log start of deployment process
  logAction('deploy_start', {
    timestamp: startTime.toISOString(),
    args: process.argv.slice(2)
  });

  // Verifica se foi passado algum argumento
  if (process.argv.length < 3) {
    console.error('❌ Erro: Especifique um arquivo JSON ou diretório');
    console.log('Uso: node deploy_to_n8n.ts <arquivo.json ou diretório>');
    
    logAction('deploy_error', {
      error: 'Missing argument',
      timestamp: new Date().toISOString()
    }, 'failure');
    
    process.exit(1);
  }

  const target = path.resolve(process.cwd(), process.argv[2]);
  
  // Obtém os workflows existentes para verificação
  const existingWorkflows = await getWorkflowsFromN8n();
  
  try {
    // Verifica se o alvo é um arquivo ou diretório
    if (fs.existsSync(target)) {
      const stats = fs.statSync(target);
      
      if (stats.isDirectory()) {
        await processDirectory(target, existingWorkflows);
      } else if (stats.isFile() && target.endsWith('.json')) {
        if (await deployWorkflow(target, existingWorkflows)) {
          console.log('✅ Workflow implantado com sucesso');
        } else {
          console.error('❌ Falha ao implantar workflow');
          process.exit(1);
        }
      } else {
        console.error('❌ Erro: O arquivo deve ter extensão .json');
        
        logAction('deploy_error', {
          error: 'Invalid file type',
          target
        }, 'failure');
        
        process.exit(1);
      }
    } else {
      console.error(`❌ Erro: ${target} não encontrado`);
      
      logAction('deploy_error', {
        error: 'Target not found',
        target
      }, 'failure');
      
      process.exit(1);
    }
    
    // Log successful completion
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
    
    logAction('deploy_complete', {
      timestamp: endTime.toISOString(),
      duration,
      target: path.basename(target)
    });
    
  } catch (error) {
    // Log unexpected error
    logAction('deploy_error', {
      error: error.message,
      stack: error.stack,
      target: path.basename(target)
    }, 'failure');
    
    throw error;
  }
}

main().catch(error => {
  console.error('🛑 Erro fatal:', error);
  process.exit(1);
}); 