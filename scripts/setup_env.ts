import fs from 'fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const SAMPLE = 'env/sample.env';
const TARGET = '.env';

async function main() {
  // carrega sample.env
  const sample = (await fs.readFile(SAMPLE, 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((l) => l.trim());

  const rl = readline.createInterface({ input, output });
  const result: string[] = [];

  for (const line of sample) {
    if (line.startsWith('#') || !line.includes('=')) {
      result.push(line);
      continue;
    }
    const [key, defaultVal] = line.split('=', 2);
    const answer = await rl.question(
      `${key}${defaultVal ? ` [${defaultVal}]` : ''}: `,
    );
    result.push(`${key}=${answer || defaultVal}`);
  }
  rl.close();
  await fs.writeFile(TARGET, result.join('\n') + '\n');
  console.log(`✅  ${TARGET} salvo/atualizado com sucesso.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 