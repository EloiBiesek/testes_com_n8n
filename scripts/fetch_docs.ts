/**
 * fetch_docs.ts
 * Script to crawl n8n documentation and save to local docs folder
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://docs.n8n.io';
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'n8n');

// URLs to crawl
const URLS_TO_CRAWL = [
  '/',
  '/integrations/builtin/app-nodes/n8n-nodes-base.webhook/',
  '/integrations/builtin/app-nodes/n8n-nodes-base.http/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.function/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.set/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.merge/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.if/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.switch/',
  '/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/',
  '/integrations/builtin/app-nodes/n8n-nodes-base.mysql/',
  '/integrations/builtin/app-nodes/n8n-nodes-base.postgres/',
  '/api/api-reference/',
];

/**
 * Make directory if it doesn't exist
 */
async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

/**
 * Clean filename from URL
 */
function getFilenameFromUrl(url: string): string {
  // Remove trailing slash and replace slashes with underscores
  const cleanUrl = url.replace(/\/$/, '').replace(/\//g, '_');
  // If empty (homepage), use index
  return cleanUrl === '' ? 'index' : cleanUrl;
}

/**
 * Fetch and save document
 */
async function fetchAndSaveDoc(url: string) {
  try {
    const fullUrl = `${BASE_URL}${url}`;
    console.log(`📥 Fetching: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const filename = getFilenameFromUrl(url);
    const filePath = path.join(DOCS_DIR, `${filename}.html`);
    
    await fs.promises.writeFile(filePath, html);
    console.log(`💾 Saved to: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Starting n8n documentation crawl...');
  
  // Ensure docs directory exists
  await ensureDir(DOCS_DIR);
  
  // Create a metadata file with crawl info
  const metadataPath = path.join(DOCS_DIR, '_metadata.json');
  const metadata = {
    crawled_at: new Date().toISOString(),
    base_url: BASE_URL,
    urls_crawled: URLS_TO_CRAWL,
  };
  
  await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`📝 Created metadata file: ${metadataPath}`);
  
  // Fetch all URLs
  let successCount = 0;
  for (const url of URLS_TO_CRAWL) {
    const success = await fetchAndSaveDoc(url);
    if (success) successCount++;
  }
  
  console.log(`\n✅ Crawl complete! Successfully fetched ${successCount}/${URLS_TO_CRAWL.length} documents.`);
  console.log(`📂 Documents saved to: ${DOCS_DIR}`);
}

// Run the main function
main().catch(error => {
  console.error('❌ Crawl failed with error:', error);
  process.exit(1);
}); 