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

    console.log(`✅ Sucesso: ${workflowData.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao implantar ${filePath}:`, error);
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
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (await deployWorkflow(filePath, existingWorkflows)) {
      successCount++;
    }
  }
  
  console.log(`📊 Resultado: ${successCount}/${files.length} workflows implantados com sucesso`);
}

// Função principal
async function main() {
  // Verifica se foi passado algum argumento
  if (process.argv.length < 3) {
    console.error('❌ Erro: Especifique um arquivo JSON ou diretório');
    console.log('Uso: node deploy_to_n8n.ts <arquivo.json ou diretório>');
    process.exit(1);
  }

  const target = path.resolve(process.cwd(), process.argv[2]);
  
  // Obtém os workflows existentes para verificação
  const existingWorkflows = await getWorkflowsFromN8n();
  
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
      process.exit(1);
    }
  } else {
    console.error(`❌ Erro: ${target} não encontrado`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('🛑 Erro fatal:', error);
  process.exit(1);
}); 