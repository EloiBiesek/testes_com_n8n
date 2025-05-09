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
| `pnpm logs:today` | Idêntico ao `logs`, mostra logs de hoje|
| `pnpm logs:actions`| Visualiza logs de ações realizadas    |
| `pnpm test:logger`| Testa o sistema de log com entrada manual |
| `pnpm lint`       | ESLint + Prettier                      |
| `pnpm test`       | Testes (Vitest)                        |

> **Fluxo de trabalho sugerido**  
> 1. Rascunhe ou edite JSONs em `flows/`.  
> 2. Quando quiser publicar, mova ou copie para `flows/cursorN8Nworkflows/`.  
> 3. Rode `pnpm sync:push`.  
> 4. Para garantir que está tudo igual ao n8n, rode `pnpm sync:pull`.

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

## Contribuindo
1. Crie branch `feat/…` ou `fix/…`.<br>
2. Abra PR → CI roda lint/test.<br>
3. Siga as [Regras Cursor](context/rules.mdc).

---
_© 2025 ECBIESEK_ 