# TESTES_COM_N8N
<!-- teste log -->
<!-- teste -->
Automação de fluxos e tratamento de dados para a **ECBIESEK** usando **n8n Cloud**.

## Visão geral
1. Crie/edite fluxos em `flows/` (JSON exportado do n8n).
2. Execute `pnpm deploy <arquivo>` ou `pnpm deploy flows/` para publicar no n8n Cloud.
3. Toda lógica de publicação usa `n8n-workflow-builder` (MCP) e REST.

## Requisitos
- Node >= 18 LTS - pnpm >= 9 - Conta n8n Cloud (API habilitada)

## Variáveis de ambiente
Ver `env/sample.env`.

## Scripts úteis
| Comando           | Descrição                              |
|-------------------|----------------------------------------|
| `pnpm build`      | Transpila scripts para `dist/`         |
| `pnpm deploy`     | Envia um JSON específico (legacy)      |
| `pnpm sync:pull`  | **Pull**: atualiza `flows/cursorN8Nworkflows/` com o que está no n8n |
| `pnpm sync:push`  | **Push**: publica tudo que está em `flows/cursorN8Nworkflows/` no n8n |
| `pnpm logs`       | Visualiza logs de ações do dia atual   |
| `pnpm logs:today` | Idêntico ao `logs`, mostra logs de hoje |
| `pnpm logs:actions` | Visualiza logs de ações realizadas    |
| `pnpm test:logger` | Testa o sistema de log com entrada manual |
| `pnpm docs:crawl` | Baixa documentação n8n para consulta offline |
| `pnpm lint`       | ESLint + Prettier                      |
| `pnpm test`       | Testes (Vitest)                        |

> **Fluxo de trabalho sugerido**  
> 1. Rascunhe ou edite JSONs em `flows/`.  
> 2. Quando quiser publicar, mova ou copie para `flows/cursorN8Nworkflows/`.  
> 3. Rode `pnpm sync:push`.  
> 4. Para garantir que está tudo igual ao n8n, rode `pnpm sync:pull`.

## Workflows de Exemplo

O repositório inclui dois workflows de exemplo para ajudar você a começar:

1. **Sample Hello World** (`flows/sample_hello_world.json`): Um workflow simples que retorna uma mensagem "Hello World" em resposta a um webhook.

2. **Example Data Transform** (`flows/example_data_transform.json`): Um workflow mais complexo que demonstra como transformar dados na n8n, incluindo:
   - Geração de dados de amostra
   - Filtragem baseada em condições
   - Transformação de dados usando expressões
   - Mesclagem de diferentes fluxos de dados

Para usar estes exemplos:
1. Copie os arquivos para a pasta `flows/cursorN8Nworkflows/`
2. Execute `pnpm sync:push` para publicá-los no n8n Cloud
3. Acesse o fluxo pelo painel de controle do n8n

## Sistema de Logs

O projeto inclui dois sistemas de logs:

1. **Logs do Cursor Agent**: Armazenados em `cursor_logs/*.md`. Registra automaticamente toda interação com o Cursor Agent.

2. **Logs de Ações**: Armazenados em `cursor_logs/actions/`. Registra todas as operações de sincronização e deployment:
   - `sync_pull`: Baixar workflows do n8n
   - `sync_push`: Enviar workflows para n8n
   - `deploy_workflow`: Publicar workflow individual
   - `deploy_directory`: Publicar diretório de workflows
   
Para visualizar logs:
```bash
# Logs do dia atual (padrão)
pnpm logs

# Logs de data específica
pnpm logs 2025-05-10

# Logs de ação específica
pnpm logs sync_push

# Logs de ação específica em data específica
pnpm logs 2025-05-10 sync_push
```

## Integração Contínua

Este projeto utiliza GitHub Actions para integração contínua. Sempre que você enviar um PR ou fizer um push para a branch `main`, os seguintes checks serão executados automaticamente:

- Verificação de linting com ESLint/Prettier
- Compilação do código TypeScript 
- Execução dos testes com Vitest

Você pode ver a configuração em `.github/workflows/ci.yml`.

## MCPs Integrados 🧩

O projeto integra vários MCPs (Multipurpose Code Packages) para potencializar o desenvolvimento:

1. **context7** [![Context7](https://img.shields.io/badge/MCP-Context7-blue)](context/n8n_docs.mdc): Documentação integrada do n8n disponível em `context/n8n_docs.mdc`.

2. **fire-crawl** [![Fire-Crawl](https://img.shields.io/badge/MCP-Fire--Crawl-orange)](scripts/fetch_docs.ts): Ferramenta para raspagem de documentação. Execute `pnpm docs:crawl` para baixar a documentação do n8n para consulta offline em `docs/n8n/`.

3. **n8n-workflow-builder** [![n8n-builder](https://img.shields.io/badge/MCP-n8n--builder-green)](types/n8n-workflow-builder.d.ts): Módulo core para interação com a API do n8n Cloud.

## Contribuindo
1. Crie branch `feat/…` ou `fix/…`.<br>
2. Abra PR → CI roda lint/test.<br>
3. Siga as [Regras Cursor](context/rules.mdc).

---
_© 2025 ECBIESEK_