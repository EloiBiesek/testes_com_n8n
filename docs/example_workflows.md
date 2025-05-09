# Workflows de Exemplo

Este documento descreve em detalhes os workflows de exemplo incluídos neste repositório.

## Sample Hello World

Localização: `flows/sample_hello_world.json`

Um workflow simples que demonstra a funcionalidade básica de webhook do n8n.

### Nós do Workflow:

1. **Webhook** - Cria um endpoint acessível em `https://seu-n8n.com/webhook/hello-world`
2. **Set** - Define uma variável `message` com o valor "Hello World from n8n!"
3. **Respond to Webhook** - Retorna a mensagem como resposta JSON

### Como Testar:

1. Publique o workflow no n8n Cloud usando `pnpm sync:push`
2. Ative o workflow na interface do n8n
3. Use um navegador ou ferramenta como curl/Postman para acessar `https://seu-n8n.com/webhook/hello-world`
4. Você receberá uma resposta JSON contendo a mensagem "Hello World from n8n!"

## Example Data Transform

Localização: `flows/example_data_transform.json`

Este workflow demonstra técnicas avançadas de transformação e manipulação de dados no n8n.

### Nós do Workflow:

1. **Webhook** - Cria um endpoint acessível em `https://seu-n8n.com/webhook/data-transform`
2. **Sample Data** - Gera dados de amostra com projetos fictícios da ECBIESEK
3. **Format Data** - Converte os dados JSON para formato binário
4. **Filter Active** - Separa os projetos em duas categorias: ativos e inativos
5. **Transform Active** - Para projetos ativos, extrai e calcula informações como:
   - Nome do projeto
   - Status
   - Data de início e fim
   - Duração (calculada)
   - Prioridade (baseada nas tags)
6. **Transform Inactive** - Para projetos inativos, extrai informações básicas e verifica se estão arquivados
7. **Merge** - Recombina os dados de ambos os fluxos
8. **Respond to Webhook** - Retorna os dados transformados como resposta JSON

### Conceitos Demonstrados:

- Geração de dados de amostra usando o nó Code
- Filtragem baseada em condições usando o nó If
- Transformação e cálculos baseados em dados existentes
- Uso de expressões JavaScript dentro do n8n
- Separação e mesclagem de fluxos de dados

### Como Testar:

1. Publique o workflow no n8n Cloud usando `pnpm sync:push`
2. Ative o workflow na interface do n8n
3. Use um navegador ou ferramenta como curl/Postman para acessar `https://seu-n8n.com/webhook/data-transform`
4. Você receberá uma resposta JSON contendo os dados transformados

## Criando Seus Próprios Workflows

Use estes exemplos como ponto de partida para criar seus próprios workflows. Recomendações:

1. Exporte seus workflows do n8n como JSON
2. Armazene-os na pasta `flows/` com nomes descritivos
3. Adicione documentação adequada
4. Quando estiver pronto para publicar, mova para `flows/cursorN8Nworkflows/`
5. Execute `pnpm sync:push`

Lembre-se de seguir as [Regras Cursor](../context/rules.mdc) e adicionar comentários adequados dentro do JSON para facilitar a manutenção futura. 